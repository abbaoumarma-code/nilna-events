<?php
/* NILNA Events — staff dashboard API (customers, quotations, proposals, invoices, email).
   Storage: one JSON file kept OUTSIDE the public web folder when the host allows it. */
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Robots-Tag: noindex, nofollow');
header('X-Content-Type-Options: nosniff');

const FROM_EMAIL = 'info@nilnaevents.com';
const FROM_NAME  = 'NILNA Events';

/* ---------- storage location ---------- */
function data_dir(): string {
  static $d = null;
  if ($d !== null) return $d;
  $outside = dirname(__DIR__, 2) . '/nilna_dm_data';           // e.g. /home/uX/domains/nilnaevents.com/nilna_dm_data
  if ((is_dir($outside) || @mkdir($outside, 0700, true)) && is_writable($outside)) return $d = $outside;
  $inside = __DIR__ . '/data';                                   // fallback, locked by .htaccess
  if (!is_dir($inside)) @mkdir($inside, 0700, true);
  if (!file_exists("$inside/.htaccess")) @file_put_contents("$inside/.htaccess", "Require all denied\nDeny from all\n");
  if (!file_exists("$inside/index.html")) @file_put_contents("$inside/index.html", '');
  return $d = $inside;
}
function auth_file(): string { return data_dir() . '/auth.json'; }
function db_file(): string { return data_dir() . '/db.json'; }

function empty_db(): array {
  return ['customers' => [], 'docs' => [], 'emails' => [], 'counters' => ['QT' => 0, 'PR' => 0, 'INV' => 0],
    'settings' => [
      'company' => 'NILNA Events Management', 'tagline' => 'Event planning & decoration',
      'address' => 'Dubai, United Arab Emirates', 'phone' => '+971 58 564 9298', 'email' => FROM_EMAIL,
      'website' => 'nilnaevents.com', 'trn' => '', 'vat' => 5, 'currency' => 'AED',
      'bank' => '', 'quoteTerms' => "50% advance to confirm the booking, balance due 3 days before the event.\nPrices include setup and removal within Dubai.\nQuotation valid for 14 days.",
      'invoiceTerms' => "Payment by bank transfer or card. Please quote the invoice number as the payment reference.",
      'signature' => "Warm regards,\nNILNA Events Management\n+971 58 564 9298 · info@nilnaevents.com · nilnaevents.com",
    ]];
}

/* Read-modify-write under an exclusive lock so two staff never overwrite each other. */
function with_db(callable $fn, bool $write = true) {
  $f = db_file();
  $h = fopen($f, 'c+');
  if (!$h) fail('Storage is not writable on the server.', 500);
  flock($h, $write ? LOCK_EX : LOCK_SH);
  $raw = stream_get_contents($h);
  $db = $raw ? json_decode($raw, true) : null;
  if (!is_array($db)) $db = empty_db();
  $db += empty_db();
  $db['settings'] += empty_db()['settings'];
  $out = $fn($db);
  if ($write) {
    if (file_exists($f) && filesize($f) > 0) @copy($f, data_dir() . '/db.backup.json');
    ftruncate($h, 0); rewind($h);
    fwrite($h, json_encode($db, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    fflush($h);
  }
  flock($h, LOCK_UN); fclose($h);
  return $out;
}

function out($x, int $code = 200): void { http_response_code($code); echo json_encode($x, JSON_UNESCAPED_UNICODE); exit; }
function fail(string $m, int $code = 400): void { out(['error' => $m], $code); }
function s($v, int $max = 4000): string { return is_scalar($v) ? mb_substr(trim((string)$v), 0, $max) : ''; }
function num($v): float { return is_numeric($v) ? round((float)$v, 2) : 0.0; }
function uid(): string { return bin2hex(random_bytes(8)); }
function now(): string { return gmdate('c'); }

/* ---------- session ---------- */
session_name('nilna_dm');
session_set_cookie_params(['lifetime' => 0, 'path' => '/dm/', 'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https', 'httponly' => true, 'samesite' => 'Strict']);
session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('POST only', 405);
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) fail('JSON only', 415);
$in = json_decode(file_get_contents('php://input') ?: '{}', true) ?: [];
$action = s($in['action'] ?? '', 40);

$auth = file_exists(auth_file()) ? (json_decode((string)file_get_contents(auth_file()), true) ?: []) : [];
$configured = !empty($auth['hash']);

/* ---------- public actions ---------- */
if ($action === 'status') out(['configured' => $configured, 'signedIn' => !empty($_SESSION['ok'])]);

if ($action === 'setup') {
  if ($configured) fail('Already set up.', 403);
  $pw = (string)($in['password'] ?? '');
  if (strlen($pw) < 10) fail('Use at least 10 characters.');
  $user = s($in['username'] ?? '', 120);
  if ($user === '') fail('Choose a username.');
  file_put_contents(auth_file(), json_encode(['user' => $user, 'hash' => password_hash($pw, PASSWORD_DEFAULT), 'fails' => 0, 'lockUntil' => 0]));
  @chmod(auth_file(), 0600);
  session_regenerate_id(true); $_SESSION['ok'] = true;
  out(['ok' => true]);
}

if ($action === 'login') {
  if (!$configured) fail('Not set up yet.', 409);
  if (($auth['lockUntil'] ?? 0) > time()) fail('Too many attempts. Try again in a few minutes.', 429);
  $userOk = empty($auth['user']) || strcasecmp(trim((string)($in['username'] ?? '')), $auth['user']) === 0;
  if ($userOk && password_verify((string)($in['password'] ?? ''), $auth['hash'])) {
    $auth['fails'] = 0; $auth['lockUntil'] = 0;
    file_put_contents(auth_file(), json_encode($auth));
    session_regenerate_id(true); $_SESSION['ok'] = true;
    out(['ok' => true]);
  }
  $auth['fails'] = ($auth['fails'] ?? 0) + 1;
  if ($auth['fails'] >= 5) { $auth['lockUntil'] = time() + 600; $auth['fails'] = 0; }
  file_put_contents(auth_file(), json_encode($auth));
  sleep(1);
  fail('Wrong username or password.', 401);
}

if ($action === 'logout') { $_SESSION = []; session_destroy(); out(['ok' => true]); }

/* ---------- staff only ---------- */
if (empty($_SESSION['ok'])) fail('Please sign in.', 401);

if ($action === 'password') {
  if (!password_verify((string)($in['current'] ?? ''), $auth['hash'])) fail('Current password is wrong.', 401);
  $pw = (string)($in['password'] ?? '');
  $user = s($in['username'] ?? '', 120);
  if ($pw === '' && $user === '') fail('Enter a new username or password.');
  if ($pw !== '' && strlen($pw) < 10) fail('Use at least 10 characters.');
  if ($pw !== '') $auth['hash'] = password_hash($pw, PASSWORD_DEFAULT);
  if ($user !== '') $auth['user'] = $user;
  file_put_contents(auth_file(), json_encode($auth));
  out(['ok' => true, 'username' => $auth['user'] ?? '']);
}

if ($action === 'load') { $db = with_db(fn($db) => $db, false); $db['username'] = $auth['user'] ?? ''; out($db); }

function clean_customer(array $c, ?array $old): array {
  return [
    'id' => $old['id'] ?? uid(), 'createdAt' => $old['createdAt'] ?? now(), 'updatedAt' => now(),
    'name' => s($c['name'] ?? '', 200), 'company' => s($c['company'] ?? '', 200), 'phone' => s($c['phone'] ?? '', 60),
    'email' => s($c['email'] ?? '', 200), 'address' => s($c['address'] ?? '', 500), 'trn' => s($c['trn'] ?? '', 40),
    'source' => s($c['source'] ?? '', 40), 'status' => s($c['status'] ?? 'Lead', 40), 'language' => s($c['language'] ?? '', 40),
    'occasion' => s($c['occasion'] ?? '', 120), 'eventDate' => s($c['eventDate'] ?? '', 20), 'guests' => s($c['guests'] ?? '', 40),
    'emirate' => s($c['emirate'] ?? '', 60), 'venue' => s($c['venue'] ?? '', 200), 'budget' => s($c['budget'] ?? '', 80),
    'notes' => s($c['notes'] ?? '', 8000), 'tags' => array_values(array_slice(array_filter(array_map(fn($t) => s($t, 40), (array)($c['tags'] ?? []))), 0, 20)),
  ];
}

if ($action === 'saveCustomer') {
  $c = (array)($in['customer'] ?? []);
  if (s($c['name'] ?? '') === '') fail('Customer name is required.');
  out(with_db(function (&$db) use ($c) {
    $i = array_search($c['id'] ?? '', array_column($db['customers'], 'id'), true);
    $row = clean_customer($c, $i === false ? null : $db['customers'][$i]);
    if ($i === false) array_unshift($db['customers'], $row); else $db['customers'][$i] = $row;
    return $row;
  }));
}

if ($action === 'deleteCustomer') {
  $id = s($in['id'] ?? '', 40);
  out(with_db(function (&$db) use ($id) {
    if (array_filter($db['docs'], fn($d) => $d['customerId'] === $id && $d['type'] === 'invoice')) fail('This customer has invoices, so they can\'t be deleted. Mark them inactive instead.', 409);
    $db['customers'] = array_values(array_filter($db['customers'], fn($c) => $c['id'] !== $id));
    $db['docs'] = array_values(array_filter($db['docs'], fn($d) => $d['customerId'] !== $id));
    return ['ok' => true];
  }));
}

const PREFIX = ['quotation' => 'QT', 'proposal' => 'PR', 'invoice' => 'INV'];

function clean_doc(array $d, ?array $old): array {
  $items = [];
  foreach (array_slice((array)($d['items'] ?? []), 0, 100) as $it) {
    if (!is_array($it)) continue;
    $row = ['desc' => s($it['desc'] ?? '', 1000), 'detail' => s($it['detail'] ?? '', 2000), 'qty' => num($it['qty'] ?? 1), 'price' => num($it['price'] ?? 0)];
    if ($row['desc'] !== '' || $row['price'] != 0) $items[] = $row;
  }
  $payments = [];
  foreach (array_slice((array)($d['payments'] ?? []), 0, 50) as $p) {
    if (is_array($p) && num($p['amount'] ?? 0) != 0) $payments[] = ['date' => s($p['date'] ?? '', 20), 'amount' => num($p['amount']), 'method' => s($p['method'] ?? '', 60), 'ref' => s($p['ref'] ?? '', 120)];
  }
  return [
    'id' => $old['id'] ?? uid(), 'type' => $old['type'] ?? $d['type'], 'number' => $old['number'] ?? '',
    'createdAt' => $old['createdAt'] ?? now(), 'updatedAt' => now(),
    'customerId' => s($d['customerId'] ?? '', 40), 'fromId' => s($d['fromId'] ?? ($old['fromId'] ?? ''), 40),
    'status' => s($d['status'] ?? 'Draft', 40), 'date' => s($d['date'] ?? gmdate('Y-m-d'), 20), 'due' => s($d['due'] ?? '', 20),
    'title' => s($d['title'] ?? '', 300), 'event' => [
      'occasion' => s($d['event']['occasion'] ?? '', 120), 'date' => s($d['event']['date'] ?? '', 20), 'guests' => s($d['event']['guests'] ?? '', 40),
      'venue' => s($d['event']['venue'] ?? '', 300), 'theme' => s($d['event']['theme'] ?? '', 300)],
    'intro' => s($d['intro'] ?? '', 6000), 'concept' => s($d['concept'] ?? '', 8000), 'timeline' => s($d['timeline'] ?? '', 6000),
    'items' => $items, 'discount' => num($d['discount'] ?? 0), 'vat' => num($d['vat'] ?? 5),
    'currency' => s($d['currency'] ?? 'AED', 8), 'notes' => s($d['notes'] ?? '', 6000), 'terms' => s($d['terms'] ?? '', 6000),
    'payments' => $payments,
  ];
}

if ($action === 'saveDoc') {
  $d = (array)($in['doc'] ?? []);
  if (!isset(PREFIX[$d['type'] ?? ''])) fail('Unknown document type.');
  if (s($d['customerId'] ?? '') === '') fail('Choose a customer.');
  out(with_db(function (&$db) use ($d) {
    if (!in_array($d['customerId'], array_column($db['customers'], 'id'), true)) fail('That customer no longer exists.');
    $i = array_search($d['id'] ?? '', array_column($db['docs'], 'id'), true);
    $row = clean_doc($d, $i === false ? null : $db['docs'][$i]);
    if ($row['number'] === '') {
      $p = PREFIX[$row['type']];
      $db['counters'][$p] = ($db['counters'][$p] ?? 0) + 1;
      $row['number'] = sprintf('%s-%s-%04d', $p, substr($row['date'], 0, 4) ?: gmdate('Y'), $db['counters'][$p]);
    }
    if ($i === false) array_unshift($db['docs'], $row); else $db['docs'][$i] = $row;
    return $row;
  }));
}

if ($action === 'deleteDoc') {
  $id = s($in['id'] ?? '', 40);
  out(with_db(function (&$db) use ($id) {
    foreach ($db['docs'] as $d) if ($d['id'] === $id && $d['type'] === 'invoice' && $d['status'] !== 'Draft') fail('Issued invoices can\'t be deleted — set the status to Cancelled instead.', 409);
    $db['docs'] = array_values(array_filter($db['docs'], fn($d) => $d['id'] !== $id));
    return ['ok' => true];
  }));
}

if ($action === 'saveSettings') {
  $in_s = (array)($in['settings'] ?? []);
  out(with_db(function (&$db) use ($in_s) {
    foreach (array_keys(empty_db()['settings']) as $k) if (array_key_exists($k, $in_s)) $db['settings'][$k] = $k === 'vat' ? num($in_s[$k]) : s($in_s[$k], 6000);
    return $db['settings'];
  }));
}

if ($action === 'sendEmail') {
  $to = s($in['to'] ?? '', 200); $cc = s($in['cc'] ?? '', 400);
  $subject = s($in['subject'] ?? '', 300); $html = (string)($in['html'] ?? ''); $text = s($in['text'] ?? '', 20000);
  if (!filter_var($to, FILTER_VALIDATE_EMAIL)) fail('Enter a valid recipient email.');
  $ccList = array_values(array_filter(array_map('trim', explode(',', $cc)), fn($e) => filter_var($e, FILTER_VALIDATE_EMAIL)));
  if ($subject === '') fail('Add a subject.');
  if (strlen($html) > 400000) fail('The email is too large.');
  $html = preg_replace('#<(script|iframe|object|embed|form)\b.*?</\1>#is', '', $html);
  $b = 'b_' . uid();
  $headers = [
    'From: ' . FROM_NAME . ' <' . FROM_EMAIL . '>', 'Reply-To: ' . FROM_EMAIL, 'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="' . $b . '"', 'X-Mailer: NILNA-DM',
  ];
  if ($ccList) $headers[] = 'Cc: ' . implode(', ', $ccList);
  $body = "--$b\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($text ?: strip_tags($html)))
        . "--$b\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($html ?: nl2br(htmlspecialchars($text))))
        . "--$b--\r\n";
  $encSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
  $sent = @mail($to, $encSubject, $body, implode("\r\n", $headers), '-f' . FROM_EMAIL);
  $log = ['id' => uid(), 'at' => now(), 'to' => $to, 'cc' => implode(', ', $ccList), 'subject' => $subject, 'text' => mb_substr($text ?: strip_tags($html), 0, 4000),
    'customerId' => s($in['customerId'] ?? '', 40), 'docId' => s($in['docId'] ?? '', 40), 'status' => $sent ? 'Sent' : 'Failed'];
  with_db(function (&$db) use ($log) {
    array_unshift($db['emails'], $log);
    $db['emails'] = array_slice($db['emails'], 0, 2000);
    if ($log['status'] === 'Sent' && $log['docId']) foreach ($db['docs'] as &$d) if ($d['id'] === $log['docId'] && $d['status'] === 'Draft') $d['status'] = 'Sent';
    return null;
  });
  if (!$sent) fail('The server could not send this email. Check that info@nilnaevents.com exists in Hostinger Email.', 502);
  out(['ok' => true, 'log' => $log]);
}

if ($action === 'restore') {
  $data = $in['data'] ?? null;
  if (!is_array($data) || !isset($data['customers'], $data['docs'])) fail('That file is not a NILNA dashboard backup.');
  out(with_db(function (&$db) use ($data) {
    $db = array_replace(empty_db(), array_intersect_key($data, empty_db()));
    return ['ok' => true];
  }));
}

fail('Unknown action.', 404);
