// generated
import * as id from "./_id.js";
import * as value from "./_value.js";
import * as fact from "./_fact.js";
import * as predicate from "./_predicate.js";
import * as draft_selection from "./_draft_selection.js";
import * as command from "./_command.js";
import * as query from "./_query.js";
import * as usecase from "./_usecase.js";
import * as version from "./_version.js";
export const registry = {
    'user/drafts/id/draft_id': id.draft_id,
    'user/drafts/value/what_it_is_for': value.what_it_is_for,
    'user/drafts/value/a_text': value.a_text,
    'user/drafts/value/a_draft': value.a_draft,
    'user/drafts/fact/a_draft_has_been_kept': fact.a_draft_has_been_kept,
    'user/drafts/fact/a_draft_has_been_kept_again': fact.a_draft_has_been_kept_again,
    'user/drafts/fact/a_draft_has_been_dropped': fact.a_draft_has_been_dropped,
    'user/drafts/fact/a_draft_has_been_dropped_again': fact.a_draft_has_been_dropped_again,
    'user/drafts/predicate/a_draft_is_kept': predicate.a_draft_is_kept,
    'user/drafts/predicate/the_draft_holds_this_text': predicate.the_draft_holds_this_text,
    'user/drafts/selection/draft/the_draft_has_this_id': draft_selection.the_draft_has_this_id,
    'user/drafts/command/the_text_is_new': command.the_text_is_new,
    'user/drafts/command/no_draft_is_kept': command.no_draft_is_kept,
    'user/drafts/command/keep_a_draft': command.keep_a_draft,
    'user/drafts/command/keep_a_draft_input': command.keep_a_draft_input,
    'user/drafts/command/drop_a_draft': command.drop_a_draft,
    'user/drafts/command/drop_a_draft_input': command.drop_a_draft_input,
    'user/drafts/query/a_draft': query.a_draft,
    'user/drafts/query/a_draft_input': query.a_draft_input,
    'user/drafts/usecase/keep_a_draft': usecase.keep_a_draft,
    'user/drafts/usecase/drop_a_draft': usecase.drop_a_draft,
    'user/drafts/usecase/a_draft': usecase.a_draft,
    'user/drafts/version/drafts': version.drafts,
};
