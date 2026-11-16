# The Properties panel

The **Properties** panel shows what you have selected on the canvas: one node, one link, or how
many nodes. It is where you read a node's values, edit them, add and remove fields, read it as one
page, and see what a link is worth and who drew it. It sits on the right, above Tasks (7 in the
[workspace picture](getting-started.md#3-meet-the-canvas)). Like the other panels it can be dragged
elsewhere and resized, and **Reset panel layout** puts it back.

## What the panel shows {#what-the-panel-shows}

| You have selected | The panel shows |
|---|---|
| Nothing | *No node selected* |
| One node | Its name, its type and its fields ([A node](#a-node)) |
| Several nodes | *N nodes selected* and **Show in node table**, which opens the [node table](canvas.md#node-table) on them |
| A link (an edge) | Its two ends, its label, its evidence grade and what was recorded with it ([A link](#a-link)) |

The panel shows the selection as it is stored now, not as it was when you clicked. When you or
someone else deletes the node it shows, the panel goes back to *No node selected*; a selected link
that is deleted leaves *This link no longer exists*.

## View only {#view-only}

When you can view a project but not edit it, through its public link or as a collaborator without
edit access, the panel opens with *View only* at the top. Hovering it says *Only people who can
edit this project can change these values.* In local mode the panel always edits.

- Values are shown, opened under their row and found in the same way, and cannot be changed.
- The [value menu](#the-value-menu) copies, searches the graph, goes to nodes and opens URLs, and
  offers no new node.
- **+ Field** is not shown, no field can be removed, and the JSON view's **Edit** is disabled.
- In a link's panel, **relation** and **confidence** cannot be changed. **Re-verify** is there,
  because it writes nothing itself; applying what it proposes takes edit access.

The server decides every write. If you lose edit access while the project is open, the panel can
still look editable until the project is read again, and a value you change there is refused with
*Not saved: you do not have write access to this project.* and goes back to what is stored.

## A node {#a-node}

The top of the panel names the node:

- The icon and colour of its type, and its name as the canvas shows it.
- **ID**, and **Type** as stored (`infrastructure.domain`).
- *Last written by …* and how long ago, when this tab has seen someone write the node since it
  opened. Hover it for the session the write came from, when there is one. It is empty after a
  reload; the
  [Document view](#document-and-json-views) reads who created and changed the node from the
  activity log.
- **Table**, **Document** and **JSON**, which change how the panel shows the node. The choice is
  remembered on this device.

### The grid {#the-grid}

**Table** shows the node's fields in a grid, one row each, the name on the left and the value on
the right.

- The fields the node's type declares come first, in the order its Type Pack lists them, whether or
  not they hold anything. A `*` after a name marks a field the type requires.
- The fields the node holds and its type does not declare come after them, under **Added fields**
  and the name of the type that does not declare them. A plugin, an import, the AI agent or
  [**+ Field**](#adding-and-removing-fields) wrote them, and the type does not check their values.
- Before each name, a small marker says what the value holds now, which is not always what the type
  declares: a field declared a number that holds text shows `T`.

    | Marker | The value is |
    |---|---|
    | a dash | nothing: no value is stored |
    | `T` | text. URLs, dates, hashes and addresses are text too. |
    | `#` | a number |
    | a switch | true or false |
    | `{}` | an object |
    | `[]` | a list |

- Point at a name to see it whole with the type's description of the field. Point at a value to see
  all of it: a list one entry per line, a structure as indented JSON. A long value is cut after 16
  lines, with how much is left (`… 2,340 more characters`). The value's tip stays closed while you
  are editing it.
- Drag the line between the two columns to give the names more room.
- A node whose type declares nothing and that holds nothing shows *No properties defined for this
  type*.

When the node's Type Pack is not installed or did not load, the grid still shows every field the
node holds, each read by its value. Nothing then says which fields the type declares or requires,
the **Added fields** heading is not shown, and no value is checked when you save it.

### Finding a field {#finding-a-field}

Above the grid, **Find a field or value** and **Hide empty** narrow what it shows. Neither changes the
node, and both are there in a panel marked *View only*.

- **Find a field or value** keeps the fields whose name or value contains what you type, ignoring
  case. `first seen` finds `first_seen`. A list is matched entry by entry and JSON by its values,
  not its keys, and `AS64496` also finds a field that holds the number `64496`. **Esc** or **×**
  empties it. What you type stays when you select another node, so you can look at one field across
  several nodes.
- **Hide empty** leaves out the fields that hold nothing: no value, an empty text, an empty list or
  `{}`. `0` and `false` are values. A field the type requires (`*`) stays. The choice is remembered
  on this device.
- The field you are in stays on screen until you leave it, even when you clear it or what you type
  no longer matches.
- A field you changed stays after you leave it, whatever the finder and **Hide empty** say, until
  the change is saved. When the value is refused or the server cannot be reached, it stays with
  what you typed, so you can correct it.
- **Enter** or **F2** on the canvas opens the field the node's label shows even when the finder or
  **Hide empty** leaves it out: its row is shown while you are in it.
- While fields are left out, a line under the grid says how many are shown, how many do not match
  (**Clear** empties the finder) and how many are empty (**Show** turns **Hide empty** off).

## Reading values {#reading-values}

The grid shows each value by what it is, not only by the type that declares it: a URL with its host
picked out, a hash shortened with its algorithm beside it, a list written into one text field as
separate entries. What changes is how the value is shown. The stored value stays as it is until you
edit it.

A chevron (**›**) at the end of a value opens a view of the whole value under its row.

| Value | In the grid | Under the row |
|---|---|---|
| Long text (`description`, `bio`, a post) | The first line, and how many lines follow (`+3 lines`). | The whole text with its line breaks, **Find** and **Copy**. |
| A list written into one text field (`name_servers`, `open_ports`, `user_ids`, `tags`) | The first entries as chips, and how many there are. | One entry per row, with the host of each URL. **Copy, one per line**, **Copy defanged**, and **Edit as text**. |
| URL | The URL as stored, its host highlighted. A badge marks a URL the browser cannot read (`unreadable`) and one with a user name or password before the host (`credentials`). | Scheme, host (and its Unicode form when it is punycode), port, path, each query parameter decoded, fragment. **Defanged** shows it as `hxxps://example[.]com`, in the grid too. The other nodes with the same host. |
| Hash | The first and last eight characters, and the algorithm read from the property name or the length (`MD5`, `SHA-1`, `SHA-256`, `mmh3`, `ssdeep`, `TLSH`…). The algorithm is a label; nothing is computed. | The whole hash, **Copy**, **Lower case** for a hex hash written in capitals, and the other nodes with the same value. |
| IP address or CIDR block | The value, `v4` or `v6`, and a special-purpose range such as `private`, `loopback` or `documentation`. A block written from a host address is marked `host bits set`. | The canonical form of an address, or a block's network, netmask, first and last address and size. The other nodes in the same /24 (IPv6: /64), or with an address in the block. |
| E-mail address | The domain highlighted. | The local part, the tag after a `+`, and the domain (and its Unicode form). |
| Size, count or amount (`size_bytes`, `*_count`, `followers`, `balance`) | Digits grouped in thousands, a size also in KiB, MiB or GiB, an amount with the node's currency. | — |
| Code: a detection rule, an armored key, a raw record, a command line | Monospace, the first line. | Line numbers, highlighting for YARA, Sigma, PGP armor and WHOIS (up to 8,000 characters), **Find**, **Wrap**, **Copy**, **Download**, and **Edit**, a code editor that saves when you press **Save**. |
| Cryptocurrency address | The chain its format belongs to, and whether its checksum holds (EIP-55, Base58Check, Bech32 and Bech32m). Solana addresses and all-lowercase EVM addresses carry no checksum, and Monero's is not checked. A Base58Check address whose version byte names no chain Vineyard knows (Bitcoin Gold, Dash) shows `checksum ok` without a chain. | The format, the chain, what the node's own currency or network field says, and a link to a block explorer: the one for the network the node names, or for the format's own chain when it names none. The link asks before it opens, because the explorer sees your IP address, the time and the address you looked up. |
| JSON | One line of JSON, with **{ }** to edit it ([JSON values](#json-values)). | A tree: fold and unfold, click a key to copy its path (`rdap.events[0].action`), **Find**, and **Raw** for the indented JSON. |

A legacy Bitcoin address is the same string on Bitcoin Cash and Bitcoin SV, and an EVM address the
same string on every EVM chain, each a different account. So no explorer link is offered when the
node names a network of another format, a network Vineyard has no explorer for (Ethereum Classic,
Bitcoin Gold, Dash and others), or only `evm` or `unknown` for an address several chains share. The
view under the row says which.

Which kind a value is, is read from its declared type, the property name and the value itself, so
it can be wrong for an unusual value; a wrong reading changes only how the value is shown and, for a
list written into one text field, how the agent's `aggregate_values` counts its entries. The list of
other nodes appears in the node panel, not in the Review dialog.

### Times, choices and true or false {#times-choices-and-true-or-false}

Values of these kinds are shown as they are stored, even when the type expects something else:

- **A date and time** (`datetime`) is shown as written, and a line under it says what it reads as:
  the moment in UTC and how long ago (`2026-11-14 09:02Z · 2h ago`), the UTC time alone for a time
  more than a minute ahead, such as a certificate's expiry, or `no timezone` for a date and time
  that names no zone, an EXIF time (`2021:12:14 11:58:18`) included. A bare date, an epoch number
  and free text get no line. Nothing is converted when you save.
- **A date** (`date`) has a date picker. A `date` field that holds a time, or a date the picker
  cannot show, is shown as written, like a date and time.
- **A choice** (`enum`) is picked from the values its type lists; type to narrow the list. A stored
  value the type does not list stays on screen as itself, marked `(not in type)`, and hovering it
  says *Not one of the values this type lists.* Only a field the type does not require has a **×**
  to clear it.
- **True or false** (`boolean`) is a switch. A field that holds nothing is not shown as false: it
  reads `—`, with a choice of `true` or `false`, and hovering it says *Not collected. Nothing is
  stored here, which is not the same as false.* A value that is neither, such as `yes`, is shown as
  stored. Choosing writes `true` or `false`.
- **A number** field that holds text, such as `AS13335` from an import, shows the text rather than
  the digits in it.
- **A value with a line break** is never put in a one-line field, whatever its type declares, so no
  line is lost. It gets a field of several lines or, in a text field whose lines read as a list
  (`name_servers` written one per line), entries.

## Editing a value {#editing-a-value}

- Click a value, or move to it with **Tab**, to edit it. Long text and code grow in place.
- In a text field, a number field, a date picker, a date and time, long text and code, **Esc** puts
  the value back as stored and leaves the field. In a one-line field (text, a number, a date, a date
  and time) **Enter** saves; in long text and code **Enter** adds a line and **⌘Enter** (Mac) or
  **Ctrl+Enter** saves. A value is also saved when you leave the field. The **Enter** or **Esc**
  that finishes a Korean syllable only finishes the syllable.
- While you type, the field stays the one you clicked, even when what you have typed so far reads
  as a URL, an address or a list. It shows as that kind when you leave it.
- While you edit a URL, an e-mail or IP address, a hash or a cryptocurrency address, a line under
  the field says what is wrong with it: a rule of its type, or a checksum that fails. The type's
  rules decide what is saved.
- In a panel marked *View only*, values are shown and opened the same way and cannot be edited.

What you edit a value in depends on its declared type and on what it holds:

| The field holds | You edit it in |
|---|---|
| Text | A one-line field. |
| Text its type declares `text`, or any value with a line break, unless it reads as a list (below) | A field of several lines. Line endings stay as the value had them, so the CRLF endings of a raw WHOIS record are still CRLF after an edit. |
| A number | A number field. In one that holds text, what you type is saved as a number when it is written as one (`13335`), and refused otherwise, with the reason. |
| A choice (`enum`) | A list of the values the type lists. |
| True or false | A switch, or a choice of `true` and `false` when the field holds neither. |
| A date (`date`) | A date picker, or a text field when the picker cannot show the value. |
| A date and time (`datetime`) | A text field, with what it reads as under it. |
| A colour (`color`) | A colour picker, in hex. |
| A list of text, numbers or true/false | Entries ([Lists](#lists)). |
| An object, or a list that holds objects | One line of JSON and **{ }** ([JSON values](#json-values)). |

A list written into one text field is edited as entries: type one and press **Enter**, or remove
one with its **×**. It is saved with the separator the value already used, one per line or `, `.
To fix an entry where it stands, without moving it to the end, open the row and choose **Edit as
text**: the field is then the text as stored. **Edit as entries** turns it back.

### Lists {#lists}

A list's entries are chips, with **Add…** after them. Type an entry and press **Enter** to add it, or
press an entry's **×** to remove it. Each change is saved at once. A field its type declares a list
(`array`) is edited this way even before it holds anything.

The list keeps the kind of its entries:

- In a list of numbers, such as `open_ports` holding `[80, 443]`, an entry that reads as a number is
  stored as one, so `8080` joins as the number `8080`. One that does not, such as `8080/tcp`, is
  stored as text, and the list then holds both.
- In a list of text, an entry stays text even when it is all digits: `"01"` stays `"01"` and does not
  become `1`.
- In a list of `true` and `false`, `true` and `false` are stored as true and false.
- A list that mixes kinds has none to keep: after an edit, every entry in it is stored as text, so
  `[80, "http"]` becomes `["80", "http"]`. Edit such a list in the
  [JSON view](#document-and-json-views) to keep its numbers.
- An empty list has no kind to keep, so what you add to it is text. To start a list of numbers,
  write it in the [JSON view](#document-and-json-views).
- A whole number larger than 9,007,199,254,740,991 stays text, because as a number it would lose its
  last digits.

### JSON values {#json-values}

An object, or a list that holds anything other than text, numbers and true/false, shows as one line
of JSON. Point at it to see it indented, or open the row (**›**) for a tree. **{ }** at the end of
the line opens it in a JSON editor, on the value as it is stored when you open it.

- **Save** writes the value only when the text is valid JSON. Otherwise the editor stays open with
  the reason, and nothing is saved.
- A whole number larger than 9,007,199,254,740,991, or one too large to be a number at all (`1e400`),
  is refused. JavaScript would already have rounded it, so `18446744073709551616` would be saved as
  `18446744073709552000`. Put it in quotes, `"18446744073709551616"`, to keep every digit.
- **Cancel**, **Esc** or a click outside closes the editor without saving.
- What you save is then checked against the type like any other value
  ([Saving and checks](#saving-and-checks)).

The [JSON view](#document-and-json-views) edits the node's whole data under the same two rules.

## Saving and checks {#saving-and-checks}

- Text, a number, a date and a date and time are saved when you leave the field or press **Enter**
  (**⌘Enter** or **Ctrl+Enter** in long text and code). A switch, a choice, a list entry and a
  colour are saved as soon as you change them, and a JSON value when you press **Save** in its
  editor.
- Nothing is written when the value is what the node already holds, so clicking or tabbing through
  fields writes nothing.
- The value you changed is checked against what the type declares for it: its kind, its allowed
  values, and any pattern or range. A value that fails is not saved, and a message names the field
  and what is wrong, for example *country_code does not match the format its type requires: kr*,
  followed by the type's description of the field when it has one. What you typed stays in the
  field, so you can correct it, or, in a field that takes **Esc**, put it back
  ([Editing a value](#editing-a-value)).
- Only the fields you change are checked. An edit does not ask for the required (`*`) fields to be
  filled, so a node a plugin saved without one can still be edited. Fields the type does not
  declare, and every field of a node whose Type Pack is not installed, are not checked.
- A save the server refuses because you cannot write to the project says *Not saved: you do not
  have write access to this project.*, and the field goes back to what is stored. Any other refusal
  says *Could not save this property.* When the server cannot be reached, *Unable to reach the
  server.* In both, what you typed stays.

The checks are listed in full under
[What the app checks on node data](../develop/typepacks.md#what-the-app-checks-on-node-data).

## When others edit the same node {#when-others-edit-the-same-node}

- The panel follows the node as it is stored. A change a collaborator saves, a review that is
  applied and a write by the AI agent show in the panel as they land, without selecting the node
  again.
- A field you are typing in is left alone: a change to it that arrives meanwhile does not replace
  what you are typing. Once your save has landed, the field follows the node again. In a field that
  takes **Esc**, it puts back the value as it is stored now, a collaborator's change included.
- A save writes only the fields you changed, laid over the node as this tab holds it when the save
  is sent. A change someone else made to another field is kept.
- When two people change the same field, the later save wins, and the grid does not warn you. The
  [JSON view](#document-and-json-views) asks before it replaces a field someone else changed.
- One short window is left. The server replaces the node's whole data on each save, so a change
  someone else saves in the moment between your save being sent and the server applying it can be
  lost, even when it was to another field. Adding or removing a field, and saving from the JSON
  view, write the whole data the same way.

## The value menu {#the-value-menu}

Point at a value and **⋯** appears at the end of its cell (on a touch screen it is always there).
It opens a menu for that value:

- **Copy** copies the value as stored, line breaks included, and a structure as indented JSON.
  **Copy defanged** appears when defanging changes the value: the scheme becomes `hxxp`, `hxxps` or
  `fxp`, the dots of a host and of a URL's path become `[.]`, an e-mail's `@` becomes `[@]` and an
  IPv6 address's colons `[:]`, and a URL inside a URL (a redirect's target) is defanged too. A
  host name or an e-mail address is defanged whatever its top-level domain, `dc01.corp` and
  `user@evil.zz` included. **Copy refanged** appears when the value was stored defanged.
  Refanging a defanged copy gives back the value exactly.
- **Search the graph** puts the value, refanged, in the canvas's search box and shows the results,
  so `evil[.]example` finds `evil.example`. It is offered for a value on one line of up to 256
  characters, and for a number.
- When the whole value is one indicator (an IP address or block, a domain, a URL with its scheme,
  an e-mail address, a phone number, a hash, a CVE id, a Bitcoin, TRON or EVM address), the menu
  offers the node it names:
    - **Go to …** when a node with that identity is already in the graph, and **Select it and run
      plugins…** when an installed plugin takes its type and you can edit the project. The graph is
      asked by the value as written too, and a hash in upper case as well, so a SHA-256 stored in
      upper case or an IPv6 address written in full is found as that node. A field that holds
      the node's own identity, such as a domain's `domain_name`, offers neither, however it is
      written.
    - **Review the staged …** when a change set waiting for review already creates it.
    - Otherwise **New … node…**. It stages the node, with a link from the node that holds the value
      labelled with the field's name (`name_servers`), and opens the Review dialog. Nothing is
      written until you apply it, and you can untick the link. The link is recorded as yours, and the
      Tasks pane keeps a row that reopens the review. When an installed plugin takes the node's type,
      **Run plugins** is shown greyed with it, and with **Review the staged …** too: a plugin runs on
      a node in the graph, so the new node has to be applied first.
    - A hash is read with its field's name, as the grid reads it: a 64-digit value under `tx_hash`
      is a transaction id, and a 32-digit one under `imphash` or `ja3` a fingerprint, so neither is
      offered as a file's hash. Nor is a value in a field whose name says fingerprint or thumbprint
      (a certificate's `fingerprint_sha256`, a PGP key's `fingerprint`), or in a field declared `hash`
      that identifies its own node (a DOM hash's `hash_value`): each is the digest of that
      certificate, key or page, not of a file. A SHA-256 becomes a `threat.file_hash`, an MD5 or
      SHA-1 a `threat.indicator`. When no installed Type Pack defines the type, or the type's format refuses
      the value, the item is greyed with the reason.
- **Open in browser…**, for a URL stored with `http://` or `https://`, asks first and names the
  host the browser will connect to, with its Unicode form when it is punycode, which is how a
  look-alike host shows itself. That server sees your IP address and the time, and the page runs in
  your browser. In the desktop app it opens in your default browser, with that browser's own
  profile, cookies and fingerprint. A URL stored defanged is not offered: refang it on purpose
  first.
- **Remove field…** ends the menu of a field the node's type does not declare, also when the field
  holds nothing ([Adding and removing fields](#adding-and-removing-fields)).
- **Esc** closes the menu and nothing behind it. In the Review dialog, keys pressed in the menu or
  in its URL confirmation stay there: Space chooses the item rather than ticking the staged row, and
  Esc in the confirmation leaves the review open.

Each entry of a list written into one text field has its own **⋯** in the view under its row, so
one name server can be copied, searched for or made a node of on its own.

The menu reads a value the way the grid badges it and the AI agent's `extract_indicators` reads
text, so an address shown as `private` in the grid is reported as private there too.

In a panel marked *View only* the menu copies, searches, goes to nodes and opens URLs, and offers
no new node. A link's stored data has the menu too, and a node made from it is not linked, since a
link cannot end at another link. In the Review dialog the menu copies and opens URLs only.

## Adding and removing fields {#adding-and-removing-fields}

A node can hold fields its type does not declare. Plugins write them, and you can add your own, such
as notes or tags, without waiting for a new version of the Type Pack. The grid lists them under
**Added fields**, after the fields the type declares ([The grid](#the-grid)).

- **+ Field**, under the last row, opens a form with a **Name**, a **Kind** and a **Value**. **Add
  field** writes the field to the node at once; it is not staged for review.
- A name is lower-case letters, digits and `_`, starting with a letter, up to 31 characters. That is
  the rule a Type Pack's own field names follow, so a later version of the pack can declare the
  field under the name you gave it. A name such as `First Seen` is refused with **Use `first_seen`**
  beside it. A field the type declares is filled in its own row, and a field the node already has is
  changed in its row, so neither name is accepted here.
- Under the name, **Suggested** offers `notes` (text) and `tags` (a list), then the fields that other
  nodes of the same type carry and their type does not declare, most common first, so one field
  keeps one name across the graph. Clicking a name fills it in, with the kind the other nodes hold
  it as. A name the type declares or the node has is not suggested.
- The kinds are **Text**, **Number**, **True / false**, **List** (text entries: type one and press
  **Enter**) and **JSON** (an object `{…}` or a list `[…]`). A field is added with its value: an
  empty text, a list with no entries, and `{}` or `[]` are refused, since a field with nothing in it
  reads as one the node does not have. A number too large to store exactly is refused; choose
  **Text** to keep every digit.
- **Enter** in the name or in a number adds the field, and **⌘Enter** (Mac) or **Ctrl+Enter** adds it
  from anywhere in the form, the JSON editor included, with a list entry you are still typing.
  **Esc** or **Cancel** closes the form and drops what you typed. If the panel moves to another node
  first, the form closes and a notice offers **Copy the value**.
- Adding waits until a change you made in a row has been saved, then writes the node's data as it is
  at that moment with the new field in it, so a change saved just before, yours or someone else's,
  is kept. If someone else added a field of the same name meanwhile, the form says so and writes
  nothing.
- A field the node's type does not declare has **Remove field…** at the end of its value menu
  (**⋯**), also when it holds nothing. Vineyard asks first and shows what the field holds. If the
  field changes before you confirm, you are asked again with its new value; if someone else has
  already removed it, nothing is written. Like adding, it waits for a change you made in a row to be
  saved. Like a removal in the JSON view, it writes the node's whole data, so a change someone else
  saves at the same moment can be lost.
- A field the type declares keeps its row: clear its value instead, or, when the type does not
  require it, remove it in the JSON view. When the node's Type Pack is not installed or did not
  load, Vineyard cannot tell which fields the type declares, so **Remove field…** is not offered;
  the JSON view can still remove a field.
- In a panel marked *View only*, **+ Field** is not shown and no field can be removed.

## Document and JSON views {#document-and-json-views}

Under a node's name, **Table**, **Document** and **JSON** change how the panel shows it. The choice
is remembered on this device. **Table** is [the grid](#the-grid). **Enter** or **F2** on the canvas,
and **G** then **P**, open a field from **Document** or **JSON** too: the panel switches to
**Table** for it, and the view remembered on this device stays the one you chose.

**Document** shows the node as one page to read:

- Its title, its type, and the fields that identify it, then its one-line values, then each longer
  value under its field name: long text as paragraphs with its line breaks, a rule or a raw record
  as code, a list as entries, JSON folded to one line until you open it. Declared fields with
  nothing in them are named under *Not collected*. A value over 40 lines shows its start and
  **Show all**.
- **Source** gives when the node was created and last changed (UTC). **Who created and changed it**
  reads the account that did each from the activity log. It is read when you click, not each time
  a node is selected. Agent and plugin writes are recorded under the account that applied them. In
  local mode, and for an account that opened the project through its public link, only the times
  are shown: the activity log is for project members. If the activity log cannot be read, the page
  says so and offers **Try again**, and the last writer seen since the tab opened is shown under
  *In this session*.
- **Links** lists the node's outgoing and incoming links grouped by label, with how many carry each
  evidence grade. Click a node in the list to select it and centre it on the canvas.
- **Copy as Markdown** copies the page for a report. Every value, and every name that comes from
  the data (the title, field names, link labels, account names), is written as code, so nothing in
  it turns into a link, an image or formatting where you paste it, and line breaks are kept. Times
  are in UTC, without "3h ago". Copied before **Who created and changed it** has answered, the
  Markdown says the names were not read from the activity log.

**JSON** shows the node's whole data as indented JSON; **Tree** folds it, finds in it and copies a
key's path (`whois.events[0]`). **Edit** opens the data in the JSON editor, where a field can be
changed, added or removed.

- Saving writes only the fields you changed, added or removed. A field you left as it was keeps
  whatever the node holds when you save, so a change someone else made to it while the editor was
  open is kept. A line above the editor names the fields that changed since you opened it. If
  someone else already made every change you made, saving writes nothing.
- Before a save removes a field, or replaces a field someone else changed since you opened the
  editor, Vineyard asks. A save that removes a field writes the node's whole data, so a change
  someone else saves at the same moment can be lost.
- A field the type marks required (`*`) cannot be removed; give it another value instead. Changed
  values are checked against the type as in the table, and a number too large to store exactly has
  to be written in quotes.
- **Esc** and a click outside close the editor only while you have typed nothing. **Cancel**
  discards your edit. Nothing closes the editor while a save is on its way. A save that is
  refused (you have no write access) or fails leaves the editor open with the reason, so your edit
  can be fixed or copied.
- If the panel moves off the node while the editor holds an edit you have not saved (the agent
  selected another node, or someone deleted this one), the editor closes without saving and a
  notice offers **Copy your JSON**. A save that fails after the editor has closed is reported the
  same way.
- In a panel marked *View only*, **Edit** is disabled.

## A link {#a-link}

Click a link (an edge) on the canvas to show it in the panel. The top says what the link is and how
far to trust it:

- Its two ends, `from → to`, by their names, and its **ID**.
- Who wrote its label:
    - *Edited here*: a person, who drew the link, changed its label in this panel, or made it from a
      [value's menu](#the-value-menu).
    - *Written by the assistant*: the AI agent.
    - *Written by* and a plugin's identifier, such as `run.vineyard.plugins.crtsh_subdomains`: that
      plugin.
    - *Original label*: nothing records who wrote it, as on links written before the app recorded it.
- *Evidence:* its grade and who set it, and under them, in one line, what the grade says
  ([Evidence grades](#evidence-grades)). Who set it reads *Graded here* (a person, also for a link
  made from a value's menu), *Graded by the assistant*, *Graded by* and a plugin's identifier,
  *Graded by a re-verification* (a [Re-verify](#re-verify) you applied), *Graded by a merge* (raised
  because a merged node's writer drew the same link; see [Merging nodes](canvas.md#merging-nodes)),
  *Nobody graded this* (copied in by an import from a file
  that carried no grade), or *Grader not recorded* (graded before the app recorded who did). A link
  written before grades were recorded has no *Evidence* line.
- **Re-verify**, and beside it **Re-collect with the agent** ([Re-verify](#re-verify)).

Below them are the two values you can change when you can edit the project:

- **relation** is the link's label: what connects the two, stated as the evidence rather than the
  conclusion. Saving it changes the label on the canvas and marks it *Edited here*. A label is kept
  to 1,024 characters, and an empty one is refused with *A link needs a label saying what connects
  the two.* While **Stop and ask before anything is removed or overwritten** is on, which it is
  unless you turned it off, AI agent changes that are applied automatically are held for your review
  when they would rewrite a label a person wrote ([AI agent settings](tasks.md#review-and-apply)).
- **confidence** is whether you vouch for the link: **asserted** or **unassessed**, the two grades a
  person can state. The other grades say that a check or a tool did something, so they are not
  offered. A link that holds one shows it in the list, and choosing it again writes nothing. The
  grade you choose reads *Graded here*. Changing the grade does not make the label yours, and
  changing the label does not change who graded the link.

There is no finder or **Hide empty** in a link's panel.

### Recorded with this link {#recorded-with-this-link}

Under **Recorded with this link** is everything else the link stores, read-only for everyone. It is
what the plugin or the agent that drew the link recorded with it, such as where and when the link
was observed: OTX Passive DNS, for example, stores `source`, `record_type`, `first_seen` and
`last_seen`. The list also holds `corroborated_by`, the other writers that drew the same link, which
the evidence grade counts. A link that stores nothing more, such as one you drew yourself, shows
*Nothing else is stored with this link.* The [Review dialog](running-plugins.md#reviewing-a-runs-changes)
shows the same list for a link that is waiting to be applied.

### Evidence grades {#evidence-grades}

Every link carries one grade saying how far its evidence goes. The canvas draws each grade with its
own line, and the legend's **Evidence** key lists the grades in the project
([Legend](canvas.md#legend)). Strongest first:

| Grade | What it says | Comes from |
|---|---|---|
| `assessed` | An independent check argued against this link and it held. | The independent check, or a re-verification you apply |
| `asserted` | A person vouched for this link: an analyst's judgement, not a measurement. It says nothing about whether anything checked the link. | A person. A link you draw starts here. |
| `recorded` | A tool recorded this: one end's own fields name the other, or two independent collectors both drew it. Not a claim that it was verified. | Applying a plugin's or the agent's changes, or a link made from a value's menu, which reads *Graded here* because you applied it |
| `circumstantial` | Checked, and consistent, but innocent explanations fit the same evidence. | The independent check, or a re-verification |
| `contested` | The check refused this link. It is here because a person kept it. Drawn heavier, in amber. | The independent check, or a re-verification |
| `unassessed` | Nothing on this link says it was checked. | Applying changes nothing checked, or a person taking back `asserted` |

A grade records what was known when it was set. It does not change by itself as the graph grows
around the link, only when the link is written again: by a person, by the check, or by a later run
that brings new evidence for it. **Re-verify** asks again on purpose. No grade stops you from
editing, deleting or building on a link. The
independent check is the AI agent setting **Have an independent check test each inference**
([AI agent settings](tasks.md#review-and-apply)).

### Re-verify {#re-verify}

**Re-verify** asks the independent check to judge the link again, as of now. It reads the label,
what each end records, what else the graph holds at each end (not this link), who wrote the label,
the grade on record and who gave it, the other collectors that drew the link, and how old it is. It asks your model provider, with the
key set for the [AI agent](tasks.md#the-ai-agent-panel); without a key the button says so and does
nothing.

The check writes nothing. Its verdict is staged as a change set named *Re-verification* and opened
in the Review dialog, and the Tasks pane keeps a row for it. The review says what the check made of
the link, such as `supported — still valid` or `refuted — stale`, and applying it sets the grade:

| Verdict | Grade |
|---|---|
| *still valid* | `assessed` |
| *stale* | `contested` |
| *inconclusive* | `circumstantial` |
| *not checked*: the check could not run, and a notice says why | Never lowered, and `contested` stays. As on any update, it can rise to `recorded` when one end's fields name the other or another collector drew the link (`corroborated_by`). |

A re-verification never proposes deleting the link. The check is told that a link it cannot
re-establish is not therefore false, and to call it *inconclusive*, not *stale*, unless the evidence
now contradicts it: a dead page or one failed lookup is not staleness. Even a link the check refutes
stays in the graph as `contested`, for a person to remove.
When applying the re-verification changes the grade, the grade reads *Graded by a re-verification*;
one that leaves the grade as it was leaves who graded it as well. A verdict is not applied to a link
whose label has changed since it was checked. While one is waiting for review, the button reads
**Review re-verification** and opens it.

The arrow beside the button holds **Re-collect with the agent**. It opens a new AI agent
conversation with a request filled in, not sent, asking the agent to collect fresh evidence for the
link and propose any change through review. Nothing runs until you read it and send it.

## Next / See also

- [The canvas](canvas.md): selecting nodes and links, the node table and the legend
- [Working with Type Packs](typepacks.md): the types that decide which fields a node has
- [Running plugins](running-plugins.md): the Review dialog, which shows staged values in the same grid
- [Tasks & runs](tasks.md): the AI agent and its review settings
