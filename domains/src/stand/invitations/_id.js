// generated
// The identities of `stand/invitations` from `id.ts` (DOM-25): the same objects
// under the same names, branded with their path (DOM-24), each schema with its
// output type under the same name, so that one import gives both. Only this
// module imports `id.ts`.
import { z } from 'zod';
import * as id from "./id.js";
/**
 * A stand of the relay, by its name: `assistente`, the assistant's (INV-1,
 * INV-6). The relay's configuration names the stands it has and their
 * inviters; the office keeps the invitations of any stand named.
 *
 * @see {@link id.stand}
 */
export const stand = id.stand.brand();
/**
 * An invitation left on a stand: the one the assistant left at 9:00. Chosen
 * by `invitations` from the operation that leaves it (D75.8, `identity_of`):
 * an inviter names no invitation, and a leave sent again is the same one.
 *
 * @see {@link id.invitation_id}
 */
export const invitation_id = id.invitation_id.brand();
/**
 * A take of an invitation: Bea's press of the button at 10:12. Chosen by
 * `invitations` from the take's operation (D75.8), which the page draws at
 * random (INV-3), so that only the one who took the invitation can name its
 * take, and read the ticket it took (INV-3).
 *
 * @see {@link id.take_id}
 */
export const take_id = id.take_id.brand();
