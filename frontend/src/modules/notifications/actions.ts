'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUserWithRoles } from '@/modules/authentication/service'
import { NotificationService, NOTIF_DEFAULT_PATIENT_USER_ID } from './service'
import {
  createNotificationEventSchema,
  updatePreferencesSchema,
} from './validation'
import type {
  NotificationEventInput,
  UserNotificationPreferences,
  NotificationCategory,
} from './types'

async function resolveCurrentUserId(): Promise<string> {
  const user = await getCurrentUserWithRoles().catch(() => null)
  return user?.id || NOTIF_DEFAULT_PATIENT_USER_ID
}

export async function getUserNotificationsAction(options: {
  unreadOnly?: boolean
  category?: NotificationCategory
  limit?: number
} = {}) {
  try {
    const userId = await resolveCurrentUserId()
    const notifications = await NotificationService.getNotificationsForUser(userId, options)
    return { success: true, data: notifications }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve notifications'
    return { success: false, error: message }
  }
}

export async function markNotificationReadAction(notificationId: string) {
  try {
    const userId = await resolveCurrentUserId()
    const success = await NotificationService.markAsRead(userId, notificationId)
    revalidatePath('/patient/notifications')
    revalidatePath('/clinical/notifications')
    revalidatePath('/healthcare-worker/notifications')
    return { success }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark notification as read'
    return { success: false, error: message }
  }
}

export async function markAllNotificationsReadAction() {
  try {
    const userId = await resolveCurrentUserId()
    const count = await NotificationService.markAllAsRead(userId)
    revalidatePath('/patient/notifications')
    revalidatePath('/clinical/notifications')
    revalidatePath('/healthcare-worker/notifications')
    return { success: true, count }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark all notifications as read'
    return { success: false, error: message }
  }
}

export async function acknowledgeNotificationAction(notificationId: string) {
  try {
    const userId = await resolveCurrentUserId()
    const success = await NotificationService.acknowledgeNotification(userId, notificationId)
    revalidatePath('/clinical/alerts')
    revalidatePath('/clinical/notifications')
    return { success }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to acknowledge alert'
    return { success: false, error: message }
  }
}

export async function getUserPreferencesAction() {
  try {
    const userId = await resolveCurrentUserId()
    const preferences = await NotificationService.getUserPreferences(userId)
    return { success: true, data: preferences }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve notification preferences'
    return { success: false, error: message }
  }
}

export async function updateUserPreferencesAction(rawInput: Partial<UserNotificationPreferences>) {
  try {
    const validated = updatePreferencesSchema.parse(rawInput)
    const userId = await resolveCurrentUserId()
    const preferences = await NotificationService.updateUserPreferences(userId, validated)
    revalidatePath('/patient/settings')
    return { success: true, data: preferences }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update preferences'
    return { success: false, error: message }
  }
}

export async function getAdminNotificationMetricsAction() {
  try {
    const metrics = await NotificationService.getAdminDeliveryMetrics()
    return { success: true, data: metrics }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve delivery metrics'
    return { success: false, error: message }
  }
}

export async function retryNotificationDeliveryAction(deliveryId: string) {
  try {
    const delivery = await NotificationService.retryFailedDelivery(deliveryId)
    revalidatePath('/admin/notifications')
    return { success: true, data: delivery }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retry notification delivery'
    return { success: false, error: message }
  }
}

export async function createNotificationEventAction(rawInput: NotificationEventInput) {
  try {
    const validated = createNotificationEventSchema.parse(rawInput)
    const result = await NotificationService.createNotificationEvent(validated)
    revalidatePath('/patient/notifications')
    revalidatePath('/clinical/notifications')
    revalidatePath('/healthcare-worker/notifications')
    revalidatePath('/admin/notifications')
    return { success: true, data: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create notification event'
    return { success: false, error: message }
  }
}
