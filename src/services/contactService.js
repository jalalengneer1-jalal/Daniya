import { assertSuccess, client } from './serviceUtils';

export async function submitContact(payload) {
  const { data, error } = await client().functions.invoke('submit-contact', { body: payload });
  assertSuccess(error || (!data?.ok ? new Error('contact rejected') : null));
  return data;
}
