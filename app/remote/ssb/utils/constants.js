/**
 * For compatibility with Patchwork, we select the same (arbitrary!) limit of
 * PM recipients, which is 8 (including the selfId!). For practical purposes in
 * the app we think in terms of *other* recipients, so 8 - 1 = 7.
 */
export const MAX_PRIVATE_MESSAGE_RECIPIENTS = 7;
