// generated
import * as id from "./_id.js";
import * as value from "./_value.js";
import * as fact from "./_fact.js";
import * as predicate from "./_predicate.js";
import * as effect from "./_effect.js";
import * as deposit_selection from "./_deposit_selection.js";
import * as command from "./_command.js";
import * as query from "./_query.js";
import * as usecase from "./_usecase.js";
import * as version from "./_version.js";
export const registry = {
    'mailbox/deposits/id/deposit_address': id.deposit_address,
    'mailbox/deposits/id/deposit_id': id.deposit_id,
    'mailbox/deposits/value/envelope': value.envelope,
    'mailbox/deposits/value/deposit_status': value.deposit_status,
    'mailbox/deposits/value/kept_deposit': value.kept_deposit,
    'mailbox/deposits/value/discarded_deposit': value.discarded_deposit,
    'mailbox/deposits/value/deposit': value.deposit,
    'mailbox/deposits/value/collected_envelope': value.collected_envelope,
    'mailbox/deposits/fact/an_envelope_has_been_deposited': fact.an_envelope_has_been_deposited,
    'mailbox/deposits/fact/an_envelope_has_been_discarded': fact.an_envelope_has_been_discarded,
    'mailbox/deposits/predicate/a_deposit_has_this_id': predicate.a_deposit_has_this_id,
    'mailbox/deposits/predicate/the_envelope_is_kept': predicate.the_envelope_is_kept,
    'mailbox/deposits/effect/wait_seven_days_from_the_deposit': effect.wait_seven_days_from_the_deposit,
    'mailbox/deposits/selection/deposit/the_envelope_is_on_this_address': deposit_selection.the_envelope_is_on_this_address,
    'mailbox/deposits/selection/deposit/the_envelope_is_kept': deposit_selection.the_envelope_is_kept,
    'mailbox/deposits/command/the_deposit_is_new': command.the_deposit_is_new,
    'mailbox/deposits/command/deposit_an_envelope': command.deposit_an_envelope,
    'mailbox/deposits/command/deposit_an_envelope_input': command.deposit_an_envelope_input,
    'mailbox/deposits/command/discard_an_envelope': command.discard_an_envelope,
    'mailbox/deposits/command/discard_an_envelope_input': command.discard_an_envelope_input,
    'mailbox/deposits/query/the_envelope_is_waiting_in_the_mailbox': query.the_envelope_is_waiting_in_the_mailbox,
    'mailbox/deposits/query/the_envelopes_in_a_mailbox': query.the_envelopes_in_a_mailbox,
    'mailbox/deposits/query/the_envelopes_in_a_mailbox_input': query.the_envelopes_in_a_mailbox_input,
    'mailbox/deposits/usecase/deposit_an_envelope': usecase.deposit_an_envelope,
    'mailbox/deposits/usecase/discard_an_envelope': usecase.discard_an_envelope,
    'mailbox/deposits/usecase/the_envelopes_in_a_mailbox': usecase.the_envelopes_in_a_mailbox,
    'mailbox/deposits/version/deposits': version.deposits,
};
