import { supabase } from './supabaseClient'

/**
 * Get all active shops with their services
 */
export const getShops = async () => {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select(`
        *,
        services (
          id,
          service_name,
          service_type,
          base_price,
          description
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Get shops error:', error)
    return { data: [], error }
  }
}

/**
 * Get shop by ID with services
 */
export const getShopById = async (shopId) => {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select(`
        *,
        services (
          id,
          service_name,
          service_type,
          base_price,
          price_per_unit,
          description,
          is_active
        )
      `)
      .eq('id', shopId)
      .eq('is_active', true)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Get shop by ID error:', error)
    return { data: null, error }
  }
}

/**
 * Get admin's shops
 */
export const getAdminShops = async (ownerId) => {
  try {
    const { data, error } = await supabase
      .from('shops')
      .select(`
        *,
        services (
          id,
          service_name,
          base_price
        )
      `)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Get admin shops error:', error)
    return { data: [], error }
  }
}

/**
 * Create a new booking
 */
export const createBooking = async (bookingData) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Create booking error:', error)
    return { data: null, error }
  }
}

/**
 * Get user's bookings
 */
export const getUserBookings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        shops (
          shop_name,
          phone
        ),
        services (
          service_name,
          service_type
        )
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Get user bookings error:', error)
    return { data: [], error }
  }
}

/**
 * Get all bookings for admin (for their shops)
 */
export const getAllBookingsForAdmin = async (adminId) => {
  try {
    // First get admin's shops
    const { data: shops, error: shopsError } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', adminId)

    if (shopsError) throw shopsError
    if (!shops || shops.length === 0) {
      return { data: [], error: null }
    }

    const shopIds = shops.map(shop => shop.id)

    // Get bookings for those shops
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        shops (
          shop_name,
          phone
        ),
        services (
          service_name
        ),
        profiles (
          name,
          email,
          phone
        )
      `)
      .in('shop_id', shopIds)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Get all bookings error:', error)
    return { data: [], error }
  }
}

/**
 * Update booking status
 */
export const updateBookingStatus = async (bookingId, status, notes = '') => {
  try {
    // Update booking
    const { error: updateError } = await supabase
      .from('bookings')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)

    if (updateError) throw updateError

    // Note: In a real app, you'd also create a tracking entry here
    // For now, we'll just update the status

    return { data: { success: true }, error: null }
  } catch (error) {
    console.error('Update booking status error:', error)
    return { data: null, error }
  }
}

/**
 * Cancel booking
 */
export const cancelBooking = async (bookingId) => {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ 
        status: 'Cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)

    if (error) throw error
    return { data: { success: true }, error: null }
  } catch (error) {
    console.error('Cancel booking error:', error)
    return { data: null, error }
  }
}

/**
 * Approve booking completion
 */
export const approveBooking = async (bookingId) => {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({ 
        customer_approved: true,
        status: 'Completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)

    if (error) throw error
    return { data: { success: true }, error: null }
  } catch (error) {
    console.error('Approve booking error:', error)
    return { data: null, error }
  }
}
