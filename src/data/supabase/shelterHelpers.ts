import { supabase } from './client'
import { User } from '../../domain/entities/User'

export const getOrCreateShelterForUser = async (user: User) => {
  const { data: existingShelters, error: selectError } = await supabase
    .from('shelters')
    .select('id')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)

  if (selectError) throw new Error(selectError.message)
  if (existingShelters?.[0]?.id) return existingShelters[0].id as string

  const { data: created, error: insertError } = await supabase
    .from('shelters')
    .insert({
      profile_id: user.id,
      name: user.fullName || user.email || 'Refugio',
    })
    .select('id')
    .single()

  if (insertError) {
    const { data: fallback } = await supabase
      .from('shelters')
      .select('id')
      .eq('profile_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)

    if (fallback?.[0]?.id) return fallback[0].id as string
    throw new Error(insertError.message)
  }

  return created.id as string
}
