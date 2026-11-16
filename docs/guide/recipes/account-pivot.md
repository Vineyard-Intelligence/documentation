# Pivoting on an account or handle

The phishing page from [the previous recipe](phishing-domain.md) gives a Telegram contact,
`@vardelmoth_ops`, and the kit's configuration file names an e-mail address,
`vardelmoth@quillpost.test`. You want the other accounts of whoever uses them, and you want to know
which of the accounts that carry the same name are someone else's. The names here are made up
([About the examples](index.md#about-the-examples)).

## What you start with {#what-you-start-with}

- A handle, `vardelmoth_ops`, and where you saw it.
- An e-mail address, `vardelmoth@quillpost.test`. A profile URL is as good a start (starter **Start
  from a profile page**).

## Before you start {#before-you-start}

Work in the desktop app. Install from **Project → Add from Marketplace…**:

| Pack | What it adds | Needs |
|---|---|---|
| **Account & identity pivoting** (Skill Pack) | The playbook the AI agent follows for this kind of question | It requires WhatsMyName, which is installed with it |
| **WhatsMyName** | Whether a handle is registered on about 700 sites | The desktop app |
| **GitHub** | Repositories, commit identities, GPG keys and activity hours of a GitHub account | A GitHub token |
| **PGP Key Lookup** | Public keys whose user IDs name an address, from four key directories | The desktop app |
| **Disposable Email** | Whether an address's domain is a throwaway-mail service | No key |
| **Telegram** | The profile a Telegram username resolves to, read without joining | A Vineyard account (signed in) |
| **X (Twitter)** | An X account's public profile and recent posts | The desktop app |

The type packs these plugins write (Identity, Infrastructure, Social Media, Telegram) are installed
with them.

Account & identity pivoting is offered only where WhatsMyName can run, so it is missing from **Run ▸
Skill packs** in a browser. The sweep requests a profile page from each site, from your computer.

## Steps {#steps}

### 1. Put the handle and the address on the canvas {#seed}

In the **Types** panel, click **Handle** and, in the Properties panel, type `vardelmoth_ops` into
`handle`, and where you saw it into `first_seen_context`. Click **Email Address** and type
`vardelmoth@quillpost.test` into `email`.

### 2. Judge the crowd before you sweep {#judge-the-crowd}

Before anything runs, ask how many unrelated people could carry the same handle. A common word, a
first name or a fandom reference is used by thousands, and an exact match on one of them groups
nobody. `vardelmoth_ops` is unusual; `shadow` would not be. The starter **Deep-dive one handle**
(step 7) has the agent make this estimate first and say what it rests on.

### 3. Sweep the handle {#sweep}

Select the Handle, press **R**, tick **WhatsMyName Account Search** and press **Run**. Review and
apply.

Look for:

- One Account node per site where the handle was found (`username`, `platform`, `profile_url`),
  linked **same handle** from the Handle. The summary counts the likely false positives it left out
  as blocked.
- What these are: candidates. Their links are graded `recorded`, which says the tool recorded that
  an account of this name exists on that site, not that it belongs to the same person.

WhatsMyName also takes the Email Address: it sweeps the part before the `@` and links a Handle to the
address by **uses handle**.

### 4. Read the e-mail address {#email}

Select the Email Address and run **Disposable Email Check** and **PGP Key Lookup**.

Look for:

- `is_disposable` on the address. A throwaway address was made for the occasion and leads nowhere
  further.
- PGP Key nodes linked **key bound to**, with their user IDs. `user_id_sources` says, for each user
  ID, which directories served it and whether one of them verifies addresses. A key on a directory
  that does not verify can carry anyone's address.
- The other addresses in the key's user IDs, each a new Email Address to read the same way.

### 5. Read each profile for its own pivots {#profiles}

Take the candidates one at a time:

- **A GitHub account:** **GitHub GPG Keys** gives its keys and the addresses GitHub has verified on
  the account (**registered email on this account (GitHub GPG key)**). **GitHub Account Repositories**
  lists its repositories, and **GitHub Commit Identities** on a repository URL gives the names and
  addresses its commits were made with. **GitHub Activity Timeline** writes `activity_hours_utc`, the
  account's recent activity per hour of the day.
- **An X account:** **X Profile** writes its bio, location, website and join date, and **X Posts**
  its recent posts.
- **The Telegram handle:** **Telegram Resolve** on the Handle creates the Telegram user it
  **currently resolves to**, with its bio.

Look for what ties two accounts together: one profile's website or bio naming another account, the
same PGP key fingerprint on both, the same verified address. A display name, an avatar style or the
handle itself does not.

### 6. Decide each pair {#decide}

Choose **Run ▸ Skill packs**, pick **Account & identity pivoting**, and choose the starter **Are these
the same person?**. Fill **First account** and **Second account**, press **Ask the agent to follow
this**, and send the prompt. **Rule out a false match** asks the opposite question, and **Sort
candidates by how well they hold up** takes a whole list.

Look for, in the answer:

- How many people share each attribute the pair has in common, and what that figure rests on.
- Whether two shared attributes are independent or came from one act: a profile copied from another
  carries its bio, its avatar and its links all at once.
- For a pair still open, the one check that would settle it. The playbook has the agent challenge a
  same-person claim before it stages a link for it, and never stage one on a shared handle alone.

### 7. Let the agent run the whole sweep (optional) {#agent-sweep}

The starter **Deep-dive one handle** (**Handle or username**, and **What you already know
(optional)**) runs steps 2 to 6 as one investigation: it judges the crowd, sweeps, reads the profiles
it found and sorts the candidates. **Start from an email address** does the same from the address.
Its changes wait for your review turn by turn.

### 8. Record your own conclusion {#record}

When the evidence ties two accounts, draw the link yourself: select one, **⌘**-click (**Ctrl**-click)
the other, and name the link for the evidence, such as `same PGP key fingerprint` or
`bio links this account`, not for the conclusion ([Drawing edges](../canvas.md#drawing-edges)). A
link you draw is graded `asserted` and marked *Edited here*.

Keep two accounts on two platforms as two nodes. **Merge nodes…** is for one entity recorded twice,
and it deletes the nodes it folds in ([Merging nodes](../canvas.md#merging-nodes)).

## Where it ends {#where-it-ends}

The pivot ends when a pass adds no account and settles no pair, or when the leads left need a check
nothing installed can run. The starter **Summarise what the project establishes** (**Who or what the
summary is about**) reports in five parts: what is corroborated as one owner and on what evidence,
what is still a candidate and the check that would settle it, what was ruled out and why, what was
run and came back empty, and what nothing installed can reach. **What would settle the open
questions?** turns the open pairs into a list of checks.

When a lead turns into infrastructure, such as a personal domain or a mail server, go back to
[From a phishing domain to its infrastructure](phishing-domain.md).

## Pitfalls {#pitfalls}

- **A shared handle is not a shared person.** Neither is a near-variant: `vardel_moth` is another
  string, not a match.
- **An account found by name can be anyone's.** A squatter, a namesake or an account renamed since:
  read the profile before you count it.
- **Telegram usernames change hands.** A username can be released and claimed by an unrelated
  account, so **currently resolves to** is who holds it now. No result from **Telegram Phone Lookup**
  is not evidence that a number has no account.
- **A commit address is what the committer typed.** An address GitHub verified on the account, as in
  its GPG keys, is a stronger tie.
- **People are identified by name.** Two `identity.person` nodes of the same name become one; give a
  person a label that tells them apart ([Working with Type Packs](../typepacks.md)).
- **Where the data goes.** In a project on a Vineyard server, what you collect about people is stored
  on that server and seen by its collaborators, and the agent sends the nodes it reads to your AI
  provider. A case that must stay on your computer belongs in local mode, where the Telegram pack does
  not run ([Signed in or local](../modes.md)).

## Next / See also

- [Working with Skill Packs](../skillpacks.md) — the Skill pack panel and its starters
- [Reading the review and evidence grades](review-and-grades.md) — why a sweep's links read
  `recorded`, and what `asserted` says
- [Running plugins](../running-plugins.md) — keys such as the GitHub token, and the review
