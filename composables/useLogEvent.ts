import { setUser as setSentryUser } from '@sentry/nuxt'

const INTERCOM_SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000

interface EventParams {
  [key: string]: unknown
}

export function useLogEvent (eventName: string, eventParams: EventParams = {}) {
  try {
    useTrackEvent(eventName, eventParams)
  } catch {
    console.error(`Failed to track event to GA: ${eventName}`, eventParams)
  }

  if (window?.Intercom) {
    try {
      const { items, ...params } = eventParams
      if (items) {
        params.items = JSON.stringify(items)
      }
      window.Intercom('trackEvent', eventName, params)
    } catch (error) {
      console.error(`Failed to log event to Intercom: ${eventName}`, error)
    }
  }

  const { $posthog } = useNuxtApp()
  if ($posthog) {
    try {
      const posthog = $posthog()
      let posthogParams: EventParams = eventParams
      if (Array.isArray(eventParams.items)) {
        posthogParams = { ...eventParams }
        const classIds = (posthogParams.items as { id?: string }[])
          .map(item => item.id?.split('-')[0])
          .filter((id): id is string => !!id && id.startsWith('0x'))
        if (classIds.length) {
          posthogParams.nft_class_ids = classIds.join(',')
        }
      }
      posthog.capture(eventName, { app: 'book-press', ...posthogParams })
    } catch (error) {
      console.error(`Failed to log event to PostHog: ${eventName}`, error)
    }
  }
}

export function useSetLogUser (
  wallet: string | null,
  options: {
    email?: string
    displayName?: string
    likerId?: string
    likeWallet?: string
    avatar?: string
    locale?: string
    intercomToken?: string
  } = {}
) {
  const { email, displayName, likerId, likeWallet, avatar, locale, intercomToken } = options
  const nameFallback = displayName || wallet || likeWallet

  // Set user in Sentry
  if (!wallet) {
    setSentryUser(null)
  } else {
    setSentryUser({
      id: wallet,
      email,
      username: nameFallback
    })
  }

  // Set user in Intercom.
  //
  // The identity-verification JWT is signed with the LikeCoin user id as
  // `user_id`, so the client-supplied `user_id` must equal `likerId` or
  // Intercom rejects with UserIdMismatchException. Identification is
  // therefore deferred until `likerId` is known — the `userLikerInfo`
  // watcher in `app.vue` fires this path after the store has hydrated.
  if (window?.Intercom) {
    try {
      if (!wallet) {
        window.Intercom('shutdown')
      } else if (likerId) {
        window.Intercom('update', {
          intercom_user_jwt: intercomToken,
          session_duration: INTERCOM_SESSION_DURATION_MS,
          user_id: likerId,
          email,
          name: nameFallback,
          avatar: avatar
            ? {
                type: 'avatar',
                image_url: avatar
              }
            : undefined,
          evm_wallet: wallet,
          like_wallet: likeWallet,
          locale
        })
      }
    } catch (error) {
      console.error('Failed to set user data in Intercom', error)
    }
  }

  // Set user in PostHog
  const { $posthog } = useNuxtApp()
  if ($posthog) {
    try {
      const posthog = $posthog()
      if (!wallet) {
        posthog.reset()
      } else {
        posthog.identify(wallet, {
          email: email || undefined,
          name: nameFallback,
          locale
        })
      }
    } catch (error) {
      console.error('Failed to set user data in PostHog', error)
    }
  }
}
