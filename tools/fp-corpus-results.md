# Redact false-positive corpus results

Rerun: `node tools/fp-corpus.mjs`

- Date: 2026-10-03T14:24:52.630Z
- Node: v26.0.0
- Rules: plugins/redact/hooks/rules.ts, 31 rules, sha256 prefix c061294e56a777ac
- Corpus: 11 public repositories at pinned commits, shallow-fetched into /private/tmp/redact-fp-corpus
- Scanned: 42836 text files, 51442316 bytes (49.1 MB); files over 2 MB, binary files (null byte) and .git skipped
- Per-file timeout: 15 s; wall time 8.2 s with 8 worker threads

## Secret-rule hits, labelled

Every secret hit below was opened at its line and labelled by hand. Labels live in tools/fp-corpus-labels.json, keyed by repo, file, line and rule; a hit with no label shows as unreviewed.

- fixture: a hand-written fake credential (made-up password or token, elided key) in a test, docs or sample file: **8**
- real-shaped: a complete value in the exact format the rule targets (parseable PEM key, signed JWT, DB URL or Basic header with a password) published as a test vector or docs example: **60**
- false positive: the matched text is not a credential at all (code, type name, placeholder, URN, CLI word); genuinely ambiguous hits are counted here: **0**
- PII hits (pii mode, not labelled): **650**

## Summary

| repo | sha | files scanned | bytes | secret hits | pii hits | seconds |
|---|---|--:|--:|--:|--:|--:|
| changesets/changesets | c73949ba7b31 | 328 | 2190715 | 4 | 3 | 0.2 |
| psf/requests | 611c6162cbc4 | 122 | 1547802 | 6 | 70 | 0.1 |
| spf13/cobra | adbc8813901b | 65 | 631792 | 0 | 6 | 0.0 |
| GoogleCloudPlatform/microservices-demo | 38e7348eb289 | 340 | 1995447 | 0 | 30 | 0.1 |
| docker/awesome-compose | 30f4b7f6a6c3 | 458 | 8096041 | 5 | 14 | 0.1 |
| tldr-pages/tldr | 0653c297d0a8 | 39933 | 19527812 | 1 | 350 | 7.2 |
| twbs/bootstrap | c1f9b9db4dd1 | 678 | 13104586 | 0 | 72 | 0.2 |
| highlightjs/cdn-release | 47245af257d8 | 442 | 1742002 | 0 | 82 | 0.1 |
| auth0/node-jsonwebtoken | b924272f2919 | 84 | 243233 | 24 | 1 | 0.0 |
| panva/jose | 2a3a5259683f | 346 | 1584528 | 27 | 14 | 0.1 |
| motdotla/dotenv | 05215e09b735 | 40 | 778358 | 1 | 8 | 0.0 |
| **total** | | **42836** | **51442316** | **68** | **650** | **8.2** |

## Secret labels per rule

| rule | fixture | real-shaped | false positive | unreviewed | total |
|---|--:|--:|--:|--:|--:|
| auth-header | 1 | 2 | 0 | 0 | 3 |
| db-connection-url | 0 | 4 | 0 | 0 | 4 |
| generic-secret | 2 | 0 | 0 | 0 | 2 |
| generic-secret-quoted | 4 | 1 | 0 | 0 | 5 |
| jwt | 0 | 27 | 0 | 0 | 27 |
| private-key | 1 | 26 | 0 | 0 | 27 |

## Hits per rule and repo

| rule | kind | changesets | requests | cobra | microservices-demo | awesome-compose | tldr | bootstrap | cdn-release | node-jsonwebtoken | jose | dotenv | total |
|---|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| auth-header | secret | 0 | 2 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 3 |
| db-connection-url | secret | 0 | 0 | 0 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 4 |
| email | pii | 3 | 70 | 6 | 18 | 11 | 340 | 69 | 82 | 1 | 14 | 8 | 622 |
| generic-secret | secret | 1 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 2 |
| generic-secret-quoted | secret | 3 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 1 | 0 | 5 |
| jwt | secret | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 14 | 13 | 0 | 27 |
| payment-card | pii | 0 | 0 | 0 | 12 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 12 |
| phone | pii | 0 | 0 | 0 | 0 | 3 | 10 | 3 | 0 | 0 | 0 | 0 | 16 |
| private-key | secret | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 0 | 9 | 13 | 1 | 27 |

## Skipped files

- changesets/changesets: 12 binary, 0 over 2 MB, 0 timed out, 0 errors; slowest file packages/cli/CHANGELOG.md at 11 ms
- psf/requests: 5 binary, 1 over 2 MB, 0 timed out, 0 errors; slowest file ext/requests-logo.svg at 32 ms
- spf13/cobra: 1 binary, 0 over 2 MB, 0 timed out, 0 errors; slowest file completions_test.go at 5 ms
- GoogleCloudPlatform/microservices-demo: 23 binary, 1 over 2 MB, 0 timed out, 0 errors; slowest file src/paymentservice/package-lock.json at 9 ms
- docker/awesome-compose: 44 binary, 0 over 2 MB, 0 timed out, 0 errors; slowest file elasticsearch-logstash-kibana/logstash/nginx.log at 77 ms
- tldr-pages/tldr: 11 binary, 0 over 2 MB, 0 timed out, 0 errors; slowest file pages.zh/common/venv.md at 7 ms
- twbs/bootstrap: 115 binary, 0 over 2 MB, 0 timed out, 0 errors; slowest file dist/css/bootstrap.css.map at 30 ms
- highlightjs/cdn-release: 2 binary, 0 over 2 MB, 0 timed out, 0 errors; slowest file build/highlight.js at 22 ms
- auth0/node-jsonwebtoken: 0 binary, 0 over 2 MB, 0 timed out, 0 errors; slowest file CHANGELOG.md at 2 ms
- panva/jose: 2 binary, 0 over 2 MB, 0 timed out, 0 errors; slowest file package-lock.json at 6 ms
- motdotla/dotenv: 1 binary, 0 over 2 MB, 0 timed out, 0 errors; slowest file package-lock.json at 22 ms

## Secret hits

Excerpt: up to 40 characters of the line before the hit, then the first 4 characters of the matched value followed by asterisks.

| # | repo | file:line | rule | excerpt | label | note |
|--:|---|---|---|---|---|---|
| 1 | changesets/changesets | `scripts/e2e/publish.test.ts:103` | generic-secret-quoted | `const CLIENT_AUTH_TOKEN = "publ*********` | fixture | fake credential in an end-to-end test |
| 2 | changesets/changesets | `scripts/e2e/publish.test.ts:104` | generic-secret-quoted | `nst BAD_CLIENT_AUTH_TOKEN = "wr0n*******` | fixture | fake credential in an end-to-end test |
| 3 | changesets/changesets | `scripts/e2e/publish.test.ts:379` | generic-secret-quoted | `        password: "Seed**************` | fixture | fake credential in an end-to-end test |
| 4 | changesets/changesets | `scripts/e2e/publish.test.ts:671` | generic-secret | `secret: chan****************` | fixture | fake credential in an end-to-end test |
| 5 | psf/requests | `tests/certs/expired/ca/ca-private.key:1` | private-key | `----****************` | real-shaped | complete PEM private key committed as a test fixture |
| 6 | psf/requests | `tests/certs/expired/server/server.key:1` | private-key | `----****************` | real-shaped | complete PEM private key committed as a test fixture |
| 7 | psf/requests | `tests/certs/mtls/client/client.key:1` | private-key | `----****************` | real-shaped | complete PEM private key committed as a test fixture |
| 8 | psf/requests | `tests/certs/valid/server/server.key:1` | private-key | `----****************` | real-shaped | complete PEM private key committed as a test fixture |
| 9 | psf/requests | `tests/test_requests.py:2223` | auth-header | `roxy-Authorization": "Basic dXNl********` | real-shaped | Basic credential for user:pass in a test assertion |
| 10 | psf/requests | `tests/test_requests.py:2228` | auth-header | ` {"Proxy-Authorization": "Basic dXNl****` | real-shaped | Basic credential for "user:" (empty password) in a test assertion |
| 11 | docker/awesome-compose | `react-java-mysql/backend/src/main/resources/application.properties:8` | generic-secret | `ource.password=${MYSQL_PASSWORD:db-5****` | fixture | default password of a sample app (same value as db/password.txt) |
| 12 | docker/awesome-compose | `wasmedge-kafka-mysql/README.md:56` | db-connection-url | `      DATABASE_URL: mysq****************` | real-shaped | demo DB URL with the sample password used by the compose example |
| 13 | docker/awesome-compose | `wasmedge-kafka-mysql/compose.yml:27` | db-connection-url | `      DATABASE_URL: mysq****************` | real-shaped | demo DB URL with the sample password used by the compose example |
| 14 | docker/awesome-compose | `wasmedge-mysql-nginx/README.md:48` | db-connection-url | `      DATABASE_URL: mysq****************` | real-shaped | demo DB URL with the sample password used by the compose example |
| 15 | docker/awesome-compose | `wasmedge-mysql-nginx/compose.yml:17` | db-connection-url | `      DATABASE_URL: mysq****************` | real-shaped | demo DB URL with the sample password used by the compose example |
| 16 | tldr-pages/tldr | `pages/common/wait4x-http.md:20` | auth-header | `header "{{Authorization: Bearer toke****` | fixture | fake bearer token in a docs example |
| 17 | auth0/node-jsonwebtoken | `test/dsa-private.pem:1` | private-key | `----****************` | real-shaped | complete PEM private key committed as a test fixture |
| 18 | auth0/node-jsonwebtoken | `test/ecdsa-private.pem:9` | private-key | `----****************` | real-shaped | complete PEM private key committed as a test fixture |
| 19 | auth0/node-jsonwebtoken | `test/invalid_exp.tests.js:7` | jwt | `var broken_token = 'eyJh****************` | real-shaped | JWT test vector |
| 20 | auth0/node-jsonwebtoken | `test/invalid_exp.tests.js:17` | jwt | `var broken_token = 'eyJh****************` | real-shaped | JWT test vector |
| 21 | auth0/node-jsonwebtoken | `test/invalid_exp.tests.js:27` | jwt | `var broken_token = 'eyJh****************` | real-shaped | JWT test vector |
| 22 | auth0/node-jsonwebtoken | `test/invalid_exp.tests.js:37` | jwt | `var broken_token = 'eyJh****************` | real-shaped | JWT test vector |
| 23 | auth0/node-jsonwebtoken | `test/invalid_exp.tests.js:47` | jwt | `var broken_token = 'eyJh****************` | real-shaped | JWT test vector |
| 24 | auth0/node-jsonwebtoken | `test/jwt.malicious.tests.js:22` | jwt | `t maliciousToken = 'eyJh****************` | real-shaped | JWT test vector |
| 25 | auth0/node-jsonwebtoken | `test/jwt.malicious.tests.js:28` | jwt | `t maliciousToken = 'eyJh****************` | real-shaped | JWT test vector |
| 26 | auth0/node-jsonwebtoken | `test/prime256v1-private.pem:1` | private-key | `----****************` | real-shaped | complete PEM private key committed as a test fixture |
| 27 | auth0/node-jsonwebtoken | `test/priv.pem:1` | private-key | `----****************` | real-shaped | complete PEM private key committed as a test fixture |
| 28 | auth0/node-jsonwebtoken | `test/rsa-private.pem:1` | private-key | `----****************` | real-shaped | complete PEM private key committed as a test fixture |
| 29 | auth0/node-jsonwebtoken | `test/rsa-pss-invalid-salt-length-private.pem:1` | private-key | `----****************` | real-shaped | complete PEM private key committed as a test fixture |
| 30 | auth0/node-jsonwebtoken | `test/rsa-pss-private.pem:1` | private-key | `----****************` | real-shaped | complete PEM private key committed as a test fixture |
| 31 | auth0/node-jsonwebtoken | `test/secp384r1-private.pem:1` | private-key | `----****************` | real-shaped | complete PEM private key committed as a test fixture |
| 32 | auth0/node-jsonwebtoken | `test/secp521r1-private.pem:1` | private-key | `----****************` | real-shaped | complete PEM private key committed as a test fixture |
| 33 | auth0/node-jsonwebtoken | `test/undefined_secretOrPublickey.tests.js:5` | generic-secret-quoted | `var TOKEN = 'eyJh****************` | real-shaped | JWT test vector caught by the quoted-secret rule (payload e30 is too short for the jwt rule) |
| 34 | auth0/node-jsonwebtoken | `test/verify.tests.js:102` | jwt | `    const token = 'eyJh****************` | real-shaped | JWT test vector |
| 35 | auth0/node-jsonwebtoken | `test/verify.tests.js:187` | jwt | `    const token = 'eyJh****************` | real-shaped | JWT test vector |
| 36 | auth0/node-jsonwebtoken | `test/verify.tests.js:253` | jwt | `     const token = 'eyJh****************` | real-shaped | JWT test vector |
| 37 | auth0/node-jsonwebtoken | `test/verify.tests.js:273` | jwt | `     const token = 'eyJh****************` | real-shaped | JWT test vector |
| 38 | auth0/node-jsonwebtoken | `test/verify.tests.js:284` | jwt | `     const token = 'eyJh****************` | real-shaped | JWT test vector |
| 39 | auth0/node-jsonwebtoken | `test/verify.tests.js:293` | jwt | `     const token = 'eyJh****************` | real-shaped | JWT test vector |
| 40 | auth0/node-jsonwebtoken | `test/wrong_alg.tests.js:13` | jwt | `var TOKEN = 'eyJ0****************` | real-shaped | JWT test vector |
| 41 | panva/jose | `cookbook/jwe.mjs:74` | generic-secret-quoted | `      pwd: 'entr****************` | fixture | example PBES2 password in a cookbook test vector |
| 42 | panva/jose | `docs/jwk/embedded/functions/EmbeddedJWK.md:33` | jwt | `  'eyJq****************` | real-shaped | signed JWT in a usage example |
| 43 | panva/jose | `docs/jwt/sign/classes/SignJWT.md:37` | private-key | `const pkcs8 = '----****************` | real-shaped | complete PKCS #8 key in a usage example in docs or a doc comment |
| 44 | panva/jose | `docs/jwt/verify/functions/jwtVerify.md:43` | jwt | `  'eyJh****************` | real-shaped | signed JWT in a usage example |
| 45 | panva/jose | `docs/jwt/verify/functions/jwtVerify.md:69` | jwt | `  'eyJh****************` | real-shaped | signed JWT in a usage example |
| 46 | panva/jose | `docs/jwt/verify/functions/jwtVerify.md:91` | jwt | `  'eyJh****************` | real-shaped | signed JWT in a usage example |
| 47 | panva/jose | `docs/key/import/functions/importPKCS8.md:34` | private-key | `const pkcs8 = '----****************` | real-shaped | complete PKCS #8 key in a usage example in docs or a doc comment |
| 48 | panva/jose | `src/jwk/embedded.ts:25` | jwt | ` *   'eyJq****************` | real-shaped | signed JWT in a usage example |
| 49 | panva/jose | `src/jwt/sign.ts:49` | private-key | ` * const pkcs8 = '----****************` | real-shaped | complete PKCS #8 key in a usage example in docs or a doc comment |
| 50 | panva/jose | `src/jwt/verify.ts:48` | jwt | ` *   'eyJh****************` | real-shaped | signed JWT in a usage example |
| 51 | panva/jose | `src/jwt/verify.ts:76` | jwt | ` *   'eyJh****************` | real-shaped | signed JWT in a usage example |
| 52 | panva/jose | `src/jwt/verify.ts:100` | jwt | ` *   'eyJh****************` | real-shaped | signed JWT in a usage example |
| 53 | panva/jose | `src/key/import.ts:131` | private-key | ` * const pkcs8 = '----****************` | real-shaped | complete PKCS #8 key in a usage example in docs or a doc comment |
| 54 | panva/jose | `tap/fixtures.ts:10` | private-key | `      '----****************` | real-shaped | complete PEM private key committed as a test fixture |
| 55 | panva/jose | `tap/fixtures.ts:39` | private-key | `      '----****************` | real-shaped | complete PEM private key committed as a test fixture |
| 56 | panva/jose | `tap/fixtures.ts:68` | private-key | `      '----****************` | real-shaped | complete PEM private key committed as a test fixture |
| 57 | panva/jose | `tap/fixtures.ts:100` | private-key | `      '----****************` | real-shaped | complete PEM private key committed as a test fixture |
| 58 | panva/jose | `tap/fixtures.ts:141` | private-key | `      '----****************` | real-shaped | complete PEM private key committed as a test fixture |
| 59 | panva/jose | `tap/fixtures.ts:205` | private-key | `      '----****************` | real-shaped | complete PEM private key committed as a test fixture |
| 60 | panva/jose | `tap/fixtures.ts:221` | private-key | `    pkcs8: '----****************` | real-shaped | complete PEM private key committed as a test fixture |
| 61 | panva/jose | `tap/fixtures.ts:264` | private-key | `    pkcs8: '----****************` | real-shaped | complete PEM private key committed as a test fixture |
| 62 | panva/jose | `tap/fixtures.ts:321` | private-key | `    pkcs8: '----****************` | real-shaped | complete PEM private key committed as a test fixture |
| 63 | panva/jose | `test/jwt/sign.test.ts:24` | jwt | `    'eyJh****************` | real-shaped | JWT test vector |
| 64 | panva/jose | `test/jwt/sign.test.ts:35` | jwt | `    'eyJh****************` | real-shaped | JWT test vector |
| 65 | panva/jose | `test/jwt/unsecured.test.ts:19` | jwt | `  t.is(jwt, 'eyJh****************` | real-shaped | JWT test vector |
| 66 | panva/jose | `test/jwt/unsecured.test.ts:39` | jwt | `nsecuredJWT.decode('eyJh****************` | real-shaped | JWT test vector |
| 67 | panva/jose | `test/util/decode_jwt.test.ts:7` | jwt | `    'eyJh****************` | real-shaped | JWT test vector |
| 68 | motdotla/dotenv | `README.md:127` | private-key | `PRIVATE_KEY="----****************` | fixture | docs PEM with an elided body (Kh9NV... between ellipses), not a working key |

## PII hits

| # | repo | file:line | rule | excerpt |
|--:|---|---|---|---|
| 1 | changesets/changesets | `.github/workflows/ci.yml:88` | email | `fig --global user.email "you@***********` |
| 2 | changesets/changesets | `package.json:12` | email | `"Mateusz Burzyński <mate****************` |
| 3 | changesets/changesets | `packages/cli/package.json:11` | email | `"Mateusz Burzyński <mate****************` |
| 4 | psf/requests | `.github/SECURITY.md:66` | email | `ance Team, Red Hat (pyth****************` |
| 5 | psf/requests | `AUTHORS.rst:6` | email | `Stapleton Cordasco <graf****************` |
| 6 | psf/requests | `AUTHORS.rst:12` | email | `- Kenneth Reitz <me@k***************` |
| 7 | psf/requests | `AUTHORS.rst:13` | email | `- Cory Benfield <cory*************` |
| 8 | psf/requests | `AUTHORS.rst:33` | email | `- Miguel Olivares <migu***************` |
| 9 | psf/requests | `AUTHORS.rst:43` | email | `- Tom Hogans <tomh************` |
| 10 | psf/requests | `AUTHORS.rst:48` | email | `- Daniel Miller <dani****************` |
| 11 | psf/requests | `AUTHORS.rst:86` | email | `- Brendan Maguire <magu****************` |
| 12 | psf/requests | `AUTHORS.rst:88` | email | `- Danver Braganza <danv****************` |
| 13 | psf/requests | `AUTHORS.rst:95` | email | `- Michael Newman <newm****************` |
| 14 | psf/requests | `AUTHORS.rst:96` | email | `- Jonty Wareing <jont*************` |
| 15 | psf/requests | `AUTHORS.rst:100` | email | `- Justin Barber <barb****************` |
| 16 | psf/requests | `AUTHORS.rst:102` | email | `- Josh Imhoff <josh****************` |
| 17 | psf/requests | `AUTHORS.rst:103` | email | `- Arup Malakar <amal**************` |
| 18 | psf/requests | `AUTHORS.rst:111` | email | `- Matthias Rahlf <matt***************` |
| 19 | psf/requests | `AUTHORS.rst:112` | email | `- Jakub Roztocil <jaku***************` |
| 20 | psf/requests | `AUTHORS.rst:118` | email | `- David Bonner <dbon*************` |
| 21 | psf/requests | `AUTHORS.rst:120` | email | `- Johnny Goodnow <j.go****************` |
| 22 | psf/requests | `AUTHORS.rst:121` | email | `- Denis Ryzhkov <deni*************` |
| 23 | psf/requests | `AUTHORS.rst:122` | email | `- Wilfred Hughes <me@w************` |
| 24 | psf/requests | `AUTHORS.rst:123` | email | `- Dmitry Medvinsky <me@d**************` |
| 25 | psf/requests | `AUTHORS.rst:124` | email | `- Bryce Boe <bbzb**************` |
| 26 | psf/requests | `AUTHORS.rst:125` | email | `- Colin Dunklau <coli****************` |
| 27 | psf/requests | `AUTHORS.rst:126` | email | `- Bob Carroll <bob.****************` |
| 28 | psf/requests | `AUTHORS.rst:127` | email | `- Hugo Osvaldo Barrera <hugo***********` |
| 29 | psf/requests | `AUTHORS.rst:128` | email | `- Łukasz Langa <luka***********` |
| 30 | psf/requests | `AUTHORS.rst:129` | email | `- Dave Shawley <dave****************` |
| 31 | psf/requests | `AUTHORS.rst:131` | email | `- Kevin Burke <kev@***********` |
| 32 | psf/requests | `AUTHORS.rst:133` | email | `- David Pursehouse <davi****************` |
| 33 | psf/requests | `AUTHORS.rst:137` | email | `- Park Ilsu <daft****************` |
| 34 | psf/requests | `AUTHORS.rst:140` | email | `- Can Ibanoglu <can.****************` |
| 35 | psf/requests | `AUTHORS.rst:141` | email | `- Thomas Weißschuh <thom***********` |
| 36 | psf/requests | `AUTHORS.rst:142` | email | `- Jayson Vantuyl <jays****************` |
| 37 | psf/requests | `AUTHORS.rst:143` | email | `- Pengfei.X <peng*************` |
| 38 | psf/requests | `AUTHORS.rst:144` | email | `- Kamil Madac <kami****************` |
| 39 | psf/requests | `AUTHORS.rst:145` | email | `- Michael Becker <mike****************` |
| 40 | psf/requests | `AUTHORS.rst:146` | email | `- Erik Wickstrom <erik****************` |
| 41 | psf/requests | `AUTHORS.rst:149` | email | `- Jonathan Wong <evol****************` |
| 42 | psf/requests | `AUTHORS.rst:152` | email | ` Syed Suhail Ahmed <ssuh****************` |
| 43 | psf/requests | `AUTHORS.rst:156` | email | `asoob Ullah Khalid <yaso****************` |
| 44 | psf/requests | `AUTHORS.rst:165` | email | `- Jesse Shapiro <jess****************` |
| 45 | psf/requests | `AUTHORS.rst:166` | email | `- Nate Prewitt <nate****************` |
| 46 | psf/requests | `AUTHORS.rst:169` | email | `- Brian Bamsch <bbam***************` |
| 47 | psf/requests | `AUTHORS.rst:170` | email | `- Om Prakash Kumar <ompr****************` |
| 48 | psf/requests | `AUTHORS.rst:171` | email | `- Philipp Konrad <gard****************` |
| 49 | psf/requests | `AUTHORS.rst:172` | email | `- Hussain Tamboli <huss****************` |
| 50 | psf/requests | `AUTHORS.rst:175` | email | `- Moinuddin Quadri <moin************` |
| 51 | psf/requests | `AUTHORS.rst:183` | email | `- Matt Liu <lium*************` |
| 52 | psf/requests | `AUTHORS.rst:184` | email | `- Taylor Hoff <prim****************` |
| 53 | psf/requests | `AUTHORS.rst:191` | email | `- "Dull Bananas" <dull****************` |
| 54 | psf/requests | `docs/user/advanced.rst:772` | email | `50-07:00', 'email': 'me@k***************` |
| 55 | psf/requests | `docs/user/advanced.rst:867` | email | `> auth = HTTPBasicAuth('fake************` |
| 56 | psf/requests | `pyproject.toml:11` | email | `eth Reitz", email = "me@k***************` |
| 57 | psf/requests | `pyproject.toml:14` | email | `n Cordasco", email="graf****************` |
| 58 | psf/requests | `pyproject.toml:15` | email | `te Prewitt", email="nate****************` |
| 59 | psf/requests | `src/requests/__version__.py:11` | email | `__author_email__ = "me@k***************` |
| 60 | psf/requests | `tests/test_lowlevel.py:137` | email | `            b'realm="me@k***************` |
| 61 | psf/requests | `tests/test_lowlevel.py:147` | email | `            b'realm="me@k***************` |
| 62 | psf/requests | `tests/test_lowlevel.py:200` | email | `            b'realm="me@k***************` |
| 63 | psf/requests | `tests/test_lowlevel.py:203` | email | `            b'realm="me@k***************` |
| 64 | psf/requests | `tests/test_lowlevel.py:247` | email | `            b'realm="me@k***************` |
| 65 | psf/requests | `tests/test_requests.py:2836` | email | `               b"mailto:user************` |
| 66 | psf/requests | `tests/test_requests.py:2837` | email | `                "mailto:user************` |
| 67 | psf/requests | `tests/test_requests.py:2840` | email | `                "mailto:user************` |
| 68 | psf/requests | `tests/test_requests.py:2841` | email | `                "mailto:user************` |
| 69 | psf/requests | `tests/test_requests.py:2874` | email | `               b"mailto:user************` |
| 70 | psf/requests | `tests/test_requests.py:2876` | email | `                "mailto:user************` |
| 71 | psf/requests | `tests/test_requests.py:2879` | email | `                "mailto:user************` |
| 72 | psf/requests | `tests/test_requests.py:2881` | email | `                "mailto:user************` |
| 73 | psf/requests | `tests/test_utils.py:460` | email | ` ("http://user:pass pass****************` |
| 74 | spf13/cobra | `.mailmap:1` | email | `Steve Francia <stev****************` |
| 75 | spf13/cobra | `.mailmap:2` | email | `jørn Erik Pedersen <bjor****************` |
| 76 | spf13/cobra | `.mailmap:3` | email | `Fabiano Franz <ffra*************` |
| 77 | spf13/cobra | `.mailmap:3` | email | `                   <cont****************` |
| 78 | spf13/cobra | `SECURITY.md:13` | email | `. Send an email to 'cobr****************` |
| 79 | spf13/cobra | `SECURITY.md:22` | email | `he maintainers via 'cobr****************` |
| 80 | GoogleCloudPlatform/microservices-demo | `.deploystack/test:108` | email | ` config set account test****************` |
| 81 | GoogleCloudPlatform/microservices-demo | `.github/workflows/ci-main.yaml:74` | email | `  service_account: 'gith****************` |
| 82 | GoogleCloudPlatform/microservices-demo | `.github/workflows/cleanup.yaml:42` | email | `  service_account: 'gith****************` |
| 83 | GoogleCloudPlatform/microservices-demo | `.github/workflows/deploy-pr.yaml:80` | email | `  service_account: 'gith****************` |
| 84 | GoogleCloudPlatform/microservices-demo | `.github/workflows/helm-chart-ci.yaml:59` | email | `NNER_DB_USER_GSA_ID=span****************` |
| 85 | GoogleCloudPlatform/microservices-demo | `helm-chart/README.md:28` | email | `gcp-service-account=span****************` |
| 86 | GoogleCloudPlatform/microservices-demo | `src/frontend/templates/cart.html:114` | email | ` name="email" value="some***************` |
| 87 | GoogleCloudPlatform/microservices-demo | `src/frontend/templates/cart.html:168` | payment-card | `                 value="4432************` |
| 88 | GoogleCloudPlatform/microservices-demo | `src/frontend/validator/validator_test.go:36` | email | `  {"valid", "test************` |
| 89 | GoogleCloudPlatform/microservices-demo | `src/frontend/validator/validator_test.go:36` | payment-card | `ork", "United States", "5272************` |
| 90 | GoogleCloudPlatform/microservices-demo | `src/frontend/validator/validator_test.go:73` | payment-card | `ork", "United States", "5272************` |
| 91 | GoogleCloudPlatform/microservices-demo | `src/frontend/validator/validator_test.go:74` | email | `d address (too long)", "test************` |
| 92 | GoogleCloudPlatform/microservices-demo | `src/frontend/validator/validator_test.go:74` | payment-card | `ork", "United States", "5272************` |
| 93 | GoogleCloudPlatform/microservices-demo | `src/frontend/validator/validator_test.go:75` | email | `  {"invalid zip code", "test************` |
| 94 | GoogleCloudPlatform/microservices-demo | `src/frontend/validator/validator_test.go:75` | payment-card | `ork", "United States", "5272************` |
| 95 | GoogleCloudPlatform/microservices-demo | `src/frontend/validator/validator_test.go:76` | email | `  {"invalid city", "test************` |
| 96 | GoogleCloudPlatform/microservices-demo | `src/frontend/validator/validator_test.go:76` | payment-card | `ork", "United States", "5272************` |
| 97 | GoogleCloudPlatform/microservices-demo | `src/frontend/validator/validator_test.go:77` | email | `  {"invalid state", "test************` |
| 98 | GoogleCloudPlatform/microservices-demo | `src/frontend/validator/validator_test.go:77` | payment-card | `, "", "United States", "5272************` |
| 99 | GoogleCloudPlatform/microservices-demo | `src/frontend/validator/validator_test.go:78` | email | `  {"invalid country", "test************` |
| 100 | GoogleCloudPlatform/microservices-demo | `src/frontend/validator/validator_test.go:78` | payment-card | `York", "New York", "", "5272************` |
| 101 | GoogleCloudPlatform/microservices-demo | `src/frontend/validator/validator_test.go:79` | email | `  {"invalid ccNumber", "test************` |
| 102 | GoogleCloudPlatform/microservices-demo | `src/frontend/validator/validator_test.go:80` | email | ` ccMonth (month < 1)", "test************` |
| 103 | GoogleCloudPlatform/microservices-demo | `src/frontend/validator/validator_test.go:80` | payment-card | `ork", "United States", "5272************` |
| 104 | GoogleCloudPlatform/microservices-demo | `src/frontend/validator/validator_test.go:81` | email | `ccMonth (month > 12)", "test************` |
| 105 | GoogleCloudPlatform/microservices-demo | `src/frontend/validator/validator_test.go:81` | payment-card | `ork", "United States", "5272************` |
| 106 | GoogleCloudPlatform/microservices-demo | `src/frontend/validator/validator_test.go:82` | email | `cYear (not provided)", "test************` |
| 107 | GoogleCloudPlatform/microservices-demo | `src/frontend/validator/validator_test.go:82` | payment-card | `ork", "United States", "5272************` |
| 108 | GoogleCloudPlatform/microservices-demo | `src/frontend/validator/validator_test.go:83` | email | `ccCVV (not provided)", "test************` |
| 109 | GoogleCloudPlatform/microservices-demo | `src/frontend/validator/validator_test.go:83` | payment-card | `ork", "United States", "5272************` |
| 110 | docker/awesome-compose | `CONTRIBUTING.md:98` | email | `d-off-by: Joe Smith <joe.***************` |
| 111 | docker/awesome-compose | `MAINTAINERS:31` | email | ` Email = "anca****************` |
| 112 | docker/awesome-compose | `MAINTAINERS:36` | email | ` Email = "guil****************` |
| 113 | docker/awesome-compose | `aspnet-mssql/app/aspnetapp/Views/Home/Contact.cshtml:11` | phone | `    425.********` |
| 114 | docker/awesome-compose | `aspnet-mssql/app/aspnetapp/Views/Home/Contact.cshtml:15` | email | `ong> <a href="mailto:Supp***************` |
| 115 | docker/awesome-compose | `aspnet-mssql/app/aspnetapp/Views/Home/Contact.cshtml:15` | email | `Support@example.com">Supp***************` |
| 116 | docker/awesome-compose | `aspnet-mssql/app/aspnetapp/Views/Home/Contact.cshtml:16` | email | `ng> <a href="mailto:Mark****************` |
| 117 | docker/awesome-compose | `aspnet-mssql/app/aspnetapp/Views/Home/Contact.cshtml:16` | email | `keting@example.com">Mark****************` |
| 118 | docker/awesome-compose | `aspnet-mssql/app/aspnetapp/wwwroot/lib/jquery-validation/.bower.json:9` | email | `   "Jörn Zaefferer <joer****************` |
| 119 | docker/awesome-compose | `aspnet-mssql/app/aspnetapp/wwwroot/lib/jquery-validation/dist/additional-methods.js:884` | phone | ` * 212-********` |
| 120 | docker/awesome-compose | `aspnet-mssql/app/aspnetapp/wwwroot/lib/jquery-validation/dist/additional-methods.js:887` | phone | ` * 111-********` |
| 121 | docker/awesome-compose | `postgresql-pgadmin/.env:4` | email | `PGADMIN_MAIL=your**********` |
| 122 | docker/awesome-compose | `react-express-mysql/backend/package.json:6` | email | `thor": "Bret Fisher <bret***************` |
| 123 | docker/awesome-compose | `react-rust-postgres/backend/Cargo.toml:4` | email | `= ["Jérémie Drouet <jere****************` |
| 124 | tldr-pages/tldr | `.mailmap:1` | email | `Adam Herst <adam****************` |
| 125 | tldr-pages/tldr | `.mailmap:2` | email | `Daniil Baturin <dani**************` |
| 126 | tldr-pages/tldr | `.mailmap:2` | email | `rin <daniil@baturin.org> <dani**********` |
| 127 | tldr-pages/tldr | `.mailmap:3` | email | `mily Grace Seville <Emil****************` |
| 128 | tldr-pages/tldr | `.mailmap:3` | email | `lle7cfg@gmail.com> <emil****************` |
| 129 | tldr-pages/tldr | `.mailmap:4` | email | `Fazle Arefin <1625****************` |
| 130 | tldr-pages/tldr | `.mailmap:4` | email | `oreply.github.com> <fazl****************` |
| 131 | tldr-pages/tldr | `.mailmap:5` | email | `Grzegorz Baranski <root**************` |
| 132 | tldr-pages/tldr | `.mailmap:6` | email | `Ivan Baluta <ivan****************` |
| 133 | tldr-pages/tldr | `.mailmap:6` | email | `uta.dev@gmail.com> <5007****************` |
| 134 | tldr-pages/tldr | `.mailmap:7` | email | `Jack Lin <blue****************` |
| 135 | tldr-pages/tldr | `.mailmap:7` | email | `son1401@gmail.com> <4696****************` |
| 136 | tldr-pages/tldr | `.mailmap:8` | email | `Jack Lin <blue****************` |
| 137 | tldr-pages/tldr | `.mailmap:8` | email | `son1401@gmail.com> <jack****************` |
| 138 | tldr-pages/tldr | `.mailmap:9` | email | `Jennifer Falco <jenn****************` |
| 139 | tldr-pages/tldr | `.mailmap:10` | email | `Juri Dispan <juri****************` |
| 140 | tldr-pages/tldr | `.mailmap:11` | email | `Juri Dispan <juri****************` |
| 141 | tldr-pages/tldr | `.mailmap:11` | email | `dispan@posteo.net> <juri****************` |
| 142 | tldr-pages/tldr | `.mailmap:12` | email | `Kristopher <kris****************` |
| 143 | tldr-pages/tldr | `.mailmap:12` | email | `erleads@gmail.com> <kris****************` |
| 144 | tldr-pages/tldr | `.mailmap:13` | email | `Lena Pastwa <lena********` |
| 145 | tldr-pages/tldr | `.mailmap:13` | email | `twa <lena@lnps.me> <1265****************` |
| 146 | tldr-pages/tldr | `.mailmap:14` | email | `ucas Gabriel Schneider <casd************` |
| 147 | tldr-pages/tldr | `.mailmap:15` | email | `ucas Gabriel Schneider <casd************` |
| 148 | tldr-pages/tldr | `.mailmap:15` | email | `<casdpa@gmail.com> <luca****************` |
| 149 | tldr-pages/tldr | `.mailmap:16` | email | `marchersimon <5029****************` |
| 150 | tldr-pages/tldr | `.mailmap:16` | email | `oreply.github.com> <marc****************` |
| 151 | tldr-pages/tldr | `.mailmap:17` | email | `Marco Bonelli <marc************` |
| 152 | tldr-pages/tldr | `.mailmap:17` | email | `<marco@mebeim.net> <1419****************` |
| 153 | tldr-pages/tldr | `.mailmap:18` | email | `Marco Bonelli <marc************` |
| 154 | tldr-pages/tldr | `.mailmap:18` | email | `<marco@mebeim.net> <mb5.****************` |
| 155 | tldr-pages/tldr | `.mailmap:19` | email | `Marco Bonelli <marc************` |
| 156 | tldr-pages/tldr | `.mailmap:19` | email | `<marco@mebeim.net> <mebe****************` |
| 157 | tldr-pages/tldr | `.mailmap:20` | email | `mister-ben <1676****************` |
| 158 | tldr-pages/tldr | `.mailmap:20` | email | `rs.noreply.github.com> <git@************` |
| 159 | tldr-pages/tldr | `.mailmap:21` | email | `Miyuutsu <miyu****************` |
| 160 | tldr-pages/tldr | `.mailmap:21` | email | ` <miyuutsushi@gmail.com> <Miyu**********` |
| 161 | tldr-pages/tldr | `.mailmap:22` | email | `Nelson Figueroa <3081****************` |
| 162 | tldr-pages/tldr | `.mailmap:23` | email | `Niklas Heer <nikl****************` |
| 163 | tldr-pages/tldr | `.mailmap:23` | email | `eer <niklas.heer@gmail.com> <me@n*******` |
| 164 | tldr-pages/tldr | `.mailmap:24` | email | `Owen Voke <deve****************` |
| 165 | tldr-pages/tldr | `.mailmap:24` | email | `evelopment@voke.dev> <owzi**************` |
| 166 | tldr-pages/tldr | `.mailmap:25` | email | `Peter Babič <pete****************` |
| 167 | tldr-pages/tldr | `.mailmap:25` | email | `er@peterbabic.dev> <pete****************` |
| 168 | tldr-pages/tldr | `.mailmap:26` | email | `Peter Babič <pete****************` |
| 169 | tldr-pages/tldr | `.mailmap:26` | email | ` <peter@peterbabic.dev> <pete***********` |
| 170 | tldr-pages/tldr | `.mailmap:27` | email | `pixie <pixe****************` |
| 171 | tldr-pages/tldr | `.mailmap:28` | email | `pixie <pixe****************` |
| 172 | tldr-pages/tldr | `.mailmap:28` | email | `github@chrissx.de> <3526****************` |
| 173 | tldr-pages/tldr | `.mailmap:29` | email | `pixie <pixe****************` |
| 174 | tldr-pages/tldr | `.mailmap:29` | email | `github@chrissx.de> <3526****************` |
| 175 | tldr-pages/tldr | `.mailmap:30` | email | `pixie <pixe****************` |
| 176 | tldr-pages/tldr | `.mailmap:30` | email | `l+github@chrissx.de> <chri**************` |
| 177 | tldr-pages/tldr | `.mailmap:31` | email | `pixie <pixe****************` |
| 178 | tldr-pages/tldr | `.mailmap:31` | email | `xel+github@chrissx.de> <pixe************` |
| 179 | tldr-pages/tldr | `.mailmap:32` | email | `Previano Koentjoro <rein****************` |
| 180 | tldr-pages/tldr | `.mailmap:32` | email | `t@reinhart1010.id> <rein****************` |
| 181 | tldr-pages/tldr | `.mailmap:33` | email | `Romain Prieto <rpri****************` |
| 182 | tldr-pages/tldr | `.mailmap:33` | email | `oreply.github.com> <choi****************` |
| 183 | tldr-pages/tldr | `.mailmap:34` | email | `Romain Prieto <rpri****************` |
| 184 | tldr-pages/tldr | `.mailmap:34` | email | `oreply.github.com> <rpri****************` |
| 185 | tldr-pages/tldr | `.mailmap:35` | email | `Sebastiaan Speck <1257****************` |
| 186 | tldr-pages/tldr | `.mailmap:35` | email | `oreply.github.com> <shem****************` |
| 187 | tldr-pages/tldr | `.mailmap:36` | email | `Seth Falco <seth**********` |
| 188 | tldr-pages/tldr | `.mailmap:37` | email | `Tan Siret A <4017****************` |
| 189 | tldr-pages/tldr | `.mailmap:38` | email | `Tan Siret A <4017****************` |
| 190 | tldr-pages/tldr | `.mailmap:38` | email | `oreply.github.com> <4017****************` |
| 191 | tldr-pages/tldr | `.mailmap:39` | email | `Wiktor Perskawiec <wikt****************` |
| 192 | tldr-pages/tldr | `.mailmap:39` | email | `tor@perskawiec.cc> <1550****************` |
| 193 | tldr-pages/tldr | `.mailmap:40` | email | `Wiktor Perskawiec <wikt****************` |
| 194 | tldr-pages/tldr | `.mailmap:40` | email | `wiktor@perskawiec.cc> <git@*************` |
| 195 | tldr-pages/tldr | `.mailmap:41` | email | `Zlatan Vasović <zlat****************` |
| 196 | tldr-pages/tldr | `.mailmap:42` | email | `Zlatan Vasović <zlat****************` |
| 197 | tldr-pages/tldr | `.mailmap:42` | email | `vasovic@gmail.com> <lego****************` |
| 198 | tldr-pages/tldr | `contributing-guides/git-terminal.md:73` | email | `-author="Your Name <new.****************` |
| 199 | tldr-pages/tldr | `contributing-guides/git-terminal.md:93` | email | `--author "Your Name <corr***************` |
| 200 | tldr-pages/tldr | `pages.ar/common/gpg.md:15` | email | `ف 'doc.txt' للمستخدمين alic*************` |
| 201 | tldr-pages/tldr | `pages.ar/common/gpg.md:15` | email | `دمين alice@example.com و bob@***********` |
| 202 | tldr-pages/tldr | `pages.ar/common/gpg.md:17` | email | `{{[-r\|--recipient]}} {{alic*************` |
| 203 | tldr-pages/tldr | `pages.ar/common/gpg.md:17` | email | `} {{[-r\|--recipient]}} {{bob@***********` |
| 204 | tldr-pages/tldr | `pages.ar/common/gpg.md:31` | email | `المفتاح العام للمستخدم alic*************` |
| 205 | tldr-pages/tldr | `pages.ar/common/gpg.md:33` | email | `ort {{[-a\|--armor]}} {{alic*************` |
| 206 | tldr-pages/tldr | `pages.ar/common/gpg.md:35` | email | `المفتاح الخاص للمستخدم alic*************` |
| 207 | tldr-pages/tldr | `pages.ar/common/gpg.md:37` | email | `eys {{[-a\|--armor]}} {{alic*************` |
| 208 | tldr-pages/tldr | `pages.de/common/aws-google-auth.md:8` | email | `[-u\|--username]}} {{beis****************` |
| 209 | tldr-pages/tldr | `pages.de/common/aws-google-auth.md:12` | email | `[-u\|--username]}} {{beis****************` |
| 210 | tldr-pages/tldr | `pages.de/common/aws-google-auth.md:16` | email | `[-u\|--username]}} {{beis****************` |
| 211 | tldr-pages/tldr | `pages.de/common/az-logout.md:13` | email | `logout --username {{alia****************` |
| 212 | tldr-pages/tldr | `pages.de/common/bgpgrep.md:21` | phone | `master6.mrt.bz2}} -aspath '{{6449*******` |
| 213 | tldr-pages/tldr | `pages.de/common/gpg.md:15` | email | `signiere 'doc.txt' für alic*************` |
| 214 | tldr-pages/tldr | `pages.de/common/gpg.md:15` | email | `ür alice@example.com und bob@***********` |
| 215 | tldr-pages/tldr | `pages.de/common/gpg.md:17` | email | `{{[-r\|--recipient]}} {{alic*************` |
| 216 | tldr-pages/tldr | `pages.de/common/gpg.md:17` | email | `} {{[-r\|--recipient]}} {{bob@***********` |
| 217 | tldr-pages/tldr | `pages.de/common/gpg.md:31` | email | `ntlichen Schlüssel von alic*************` |
| 218 | tldr-pages/tldr | `pages.de/common/gpg.md:33` | email | `ort {{[-a\|--armor]}} {{alic*************` |
| 219 | tldr-pages/tldr | `pages.de/common/gpg.md:35` | email | `privaten Schlüssel von alic*************` |
| 220 | tldr-pages/tldr | `pages.de/common/gpg.md:37` | email | `eys {{[-a\|--armor]}} {{alic*************` |
| 221 | tldr-pages/tldr | `pages.de/linux/alpine.md:13` | email | `'alpine {{emai*************` |
| 222 | tldr-pages/tldr | `pages.es/common/aws-google-auth.md:8` | email | `{[-u\|--username]}} {{ejem***************` |
| 223 | tldr-pages/tldr | `pages.es/common/aws-google-auth.md:12` | email | `{[-u\|--username]}} {{ejem***************` |
| 224 | tldr-pages/tldr | `pages.es/common/aws-google-auth.md:16` | email | `{[-u\|--username]}} {{ejem***************` |
| 225 | tldr-pages/tldr | `pages.es/common/az-logout.md:13` | email | `logout --username {{alia****************` |
| 226 | tldr-pages/tldr | `pages.es/common/git-config.md:9` | email | `r.email}} "{{Tu nombre\|emai*************` |
| 227 | tldr-pages/tldr | `pages.es/common/gpg.md:19` | email | ` firma 'doc.txt' para 'alic*************` |
| 228 | tldr-pages/tldr | `pages.es/common/gpg.md:19` | email | `a 'alice@example.com' y 'bob@***********` |
| 229 | tldr-pages/tldr | `pages.es/common/gpg.md:21` | email | `{{[-r\|--recipient]}} {{alic*************` |
| 230 | tldr-pages/tldr | `pages.es/common/gpg.md:21` | email | `} {{[-r\|--recipient]}} {{bob@***********` |
| 231 | tldr-pages/tldr | `pages.es/common/gpg.md:35` | email | ` pública/privada para 'alic*************` |
| 232 | tldr-pages/tldr | `pages.es/common/gpg.md:37` | email | `s}} {{[-a\|--armor]}} {{alic*************` |
| 233 | tldr-pages/tldr | `pages.es/common/mail.md:13` | email | `eo electrónico}}" {{para****************` |
| 234 | tldr-pages/tldr | `pages.es/common/mail.md:17` | email | `ME archivo.txt}}" {{para****************` |
| 235 | tldr-pages/tldr | `pages.es/common/mail.md:21` | email | `ject "{{asunto}}" {{a_us****************` |
| 236 | tldr-pages/tldr | `pages.es/linux/alpine.md:13` | email | `'alpine {{corr**************` |
| 237 | tldr-pages/tldr | `pages.es/osx/mas.md:8` | email | `'mas signin "{{usua***************` |
| 238 | tldr-pages/tldr | `pages.fr/common/aws-google-auth.md:8` | email | `{[-u\|--username]}} {{exem***************` |
| 239 | tldr-pages/tldr | `pages.fr/common/aws-google-auth.md:12` | email | `{[-u\|--username]}} {{exem***************` |
| 240 | tldr-pages/tldr | `pages.fr/common/aws-google-auth.md:16` | email | `{[-u\|--username]}} {{exem***************` |
| 241 | tldr-pages/tldr | `pages.id/common/aws-google-auth.md:8` | email | `{[-u\|--username]}} {{exam***************` |
| 242 | tldr-pages/tldr | `pages.id/common/aws-google-auth.md:12` | email | `{[-u\|--username]}} {{exam***************` |
| 243 | tldr-pages/tldr | `pages.id/common/aws-google-auth.md:16` | email | `{[-u\|--username]}} {{exam***************` |
| 244 | tldr-pages/tldr | `pages.id/common/az-logout.md:13` | email | `az logout --username {{alia*************` |
| 245 | tldr-pages/tldr | `pages.id/common/git-blame-someone-else.md:8` | email | `eone-else "{{pelaku <some***************` |
| 246 | tldr-pages/tldr | `pages.id/common/git-check-mailmap.md:8` | email | `'git check-mailmap {{emai*************` |
| 247 | tldr-pages/tldr | `pages.id/common/git-coauthor.md:9` | email | `git coauthor {{nama}} {{nama************` |
| 248 | tldr-pages/tldr | `pages.id/common/git-config.md:9` | email | `r.email}} "{{Nama Anda\|sure*************` |
| 249 | tldr-pages/tldr | `pages.id/linux/alpine.md:13` | email | `'alpine {{emai*************` |
| 250 | tldr-pages/tldr | `pages.it/common/aws-google-auth.md:8` | email | `{[-u\|--username]}} {{exam***************` |
| 251 | tldr-pages/tldr | `pages.it/common/aws-google-auth.md:12` | email | `{[-u\|--username]}} {{exam***************` |
| 252 | tldr-pages/tldr | `pages.it/common/aws-google-auth.md:16` | email | `{[-u\|--username]}} {{exam***************` |
| 253 | tldr-pages/tldr | `pages.it/common/aws-sns.md:20` | phone | `pic-name"\|--phone-number +1-5***********` |
| 254 | tldr-pages/tldr | `pages.it/common/az-logout.md:13` | email | `az logout --username {{alia*************` |
| 255 | tldr-pages/tldr | `pages.ja/common/git-check-mailmap.md:8` | email | `'git check-mailmap {{emai*************` |
| 256 | tldr-pages/tldr | `pages.ja/common/git-check-mailmap.md:12` | email | `レクトリ/サブディレクトリ/ファイル}} {{emai*************` |
| 257 | tldr-pages/tldr | `pages.ja/common/git-config.md:9` | email | `user.email}} "{{あなたの名前\|emai*************` |
| 258 | tldr-pages/tldr | `pages.ja/common/gpg.md:15` | email | `- alic*************` |
| 259 | tldr-pages/tldr | `pages.ja/common/gpg.md:15` | email | `- alice@example.com と bob@***********` |
| 260 | tldr-pages/tldr | `pages.ja/common/gpg.md:17` | email | `{{[-r\|--recipient]}} {{alic*************` |
| 261 | tldr-pages/tldr | `pages.ja/common/gpg.md:17` | email | `} {{[-r\|--recipient]}} {{bob@***********` |
| 262 | tldr-pages/tldr | `pages.ja/common/gpg.md:31` | email | `- alic*************` |
| 263 | tldr-pages/tldr | `pages.ja/common/gpg.md:33` | email | `ort {{[-a\|--armor]}} {{alic*************` |
| 264 | tldr-pages/tldr | `pages.ja/common/gpg.md:35` | email | `- alic*************` |
| 265 | tldr-pages/tldr | `pages.ja/common/gpg.md:37` | email | `eys {{[-a\|--armor]}} {{alic*************` |
| 266 | tldr-pages/tldr | `pages.ko/common/aws-google-auth.md:8` | email | `{[-u\|--username]}} {{exam***************` |
| 267 | tldr-pages/tldr | `pages.ko/common/aws-google-auth.md:12` | email | `{[-u\|--username]}} {{exam***************` |
| 268 | tldr-pages/tldr | `pages.ko/common/aws-google-auth.md:16` | email | `{[-u\|--username]}} {{exam***************` |
| 269 | tldr-pages/tldr | `pages.ko/common/aws-sns.md:20` | phone | `pic-name"\|--phone-number +1-5***********` |
| 270 | tldr-pages/tldr | `pages.ko/common/az-logout.md:13` | email | `logout --username {{alia****************` |
| 271 | tldr-pages/tldr | `pages.ko/common/bgpgrep.md:21` | phone | `master6.mrt.bz2}} -aspath '{{6449*******` |
| 272 | tldr-pages/tldr | `pages.ko/common/from.md:20` | email | `'from --sender={{me@e**********` |
| 273 | tldr-pages/tldr | `pages.ko/common/git-blame-someone-else.md:8` | email | `someone-else "{{작성자 <some***************` |
| 274 | tldr-pages/tldr | `pages.ko/common/git-check-mailmap.md:8` | email | `'git check-mailmap {{emai*************` |
| 275 | tldr-pages/tldr | `pages.ko/common/git-coauthor.md:9` | email | `'git coauthor {{이름}} {{name************` |
| 276 | tldr-pages/tldr | `pages.ko/common/git-config.md:9` | email | `\|user.email}} "{{유저_이름\|emai*************` |
| 277 | tldr-pages/tldr | `pages.ko/common/git-reauthor.md:9` | email | `r {{[-o\|--old-email]}} {{old@***********` |
| 278 | tldr-pages/tldr | `pages.ko/common/git-reauthor.md:9` | email | `[-e\|--correct-email]}} {{new@***********` |
| 279 | tldr-pages/tldr | `pages.ko/common/git-reauthor.md:13` | email | `r {{[-o\|--old-email]}} {{old@***********` |
| 280 | tldr-pages/tldr | `pages.ko/common/git-reauthor.md:17` | email | `-e\|--correct-email]}} {{name************` |
| 281 | tldr-pages/tldr | `pages.ko/common/gpg.md:15` | email | `- alic*************` |
| 282 | tldr-pages/tldr | `pages.ko/common/gpg.md:15` | email | `- alice@example.com 및 bob@***********` |
| 283 | tldr-pages/tldr | `pages.ko/common/gpg.md:17` | email | `{{[-r\|--recipient]}} {{alic*************` |
| 284 | tldr-pages/tldr | `pages.ko/common/gpg.md:17` | email | `} {{[-r\|--recipient]}} {{bob@***********` |
| 285 | tldr-pages/tldr | `pages.ko/common/gpg.md:31` | email | `- alic*************` |
| 286 | tldr-pages/tldr | `pages.ko/common/gpg.md:33` | email | `ort {{[-a\|--armor]}} {{alic*************` |
| 287 | tldr-pages/tldr | `pages.ko/common/gpg.md:35` | email | `- alic*************` |
| 288 | tldr-pages/tldr | `pages.ko/common/gpg.md:37` | email | `eys {{[-a\|--armor]}} {{alic*************` |
| 289 | tldr-pages/tldr | `pages.ko/common/gyb.md:8` | email | `'gyb --email {{emai***********` |
| 290 | tldr-pages/tldr | `pages.ko/common/gyb.md:12` | email | `'gyb --email {{emai***********` |
| 291 | tldr-pages/tldr | `pages.ko/common/gyb.md:16` | email | `'gyb --email {{emai***********` |
| 292 | tldr-pages/tldr | `pages.ko/common/gyb.md:20` | email | `'gyb --email {{emai***********` |
| 293 | tldr-pages/tldr | `pages.ko/common/msmtp.md:9` | email | `cho "{{안녕하세요}}" \| msmtp {{to@e**********` |
| 294 | tldr-pages/tldr | `pages.ko/common/msmtp.md:13` | email | `mtp --account={{계정_이름}} {{to@e**********` |
| 295 | tldr-pages/tldr | `pages.ko/common/msmtp.md:17` | email | `--port={{999}} --from={{from************` |
| 296 | tldr-pages/tldr | `pages.ko/common/msmtp.md:17` | email | `om={{from@example.org}} {{to@e**********` |
| 297 | tldr-pages/tldr | `pages.ko/common/mu.md:8` | email | `/대상/폴더}} --my-address={{name************` |
| 298 | tldr-pages/tldr | `pages.ko/common/neomutt.md:12` | email | `'neomutt -s "{{제목}}" -c {{cc@e**********` |
| 299 | tldr-pages/tldr | `pages.ko/common/neomutt.md:12` | email | `{cc@example.com}} {{reci****************` |
| 300 | tldr-pages/tldr | `pages.ko/common/neomutt.md:16` | email | `로/대상/파일2 ...}} -- {{reci****************` |
| 301 | tldr-pages/tldr | `pages.ko/common/neomutt.md:20` | email | `t -i {{경로/대상/파일}} {{reci****************` |
| 302 | tldr-pages/tldr | `pages.ko/common/neomutt.md:24` | email | `t -H {{경로/대상/파일}} {{reci****************` |
| 303 | tldr-pages/tldr | `pages.ko/common/openclaw-message.md:8` | phone | `age send {{[-t\|--target]}} {{+123*******` |
| 304 | tldr-pages/tldr | `pages.ko/common/openclaw.md:18` | phone | `age send {{[-t\|--target]}} {{+123*******` |
| 305 | tldr-pages/tldr | `pages.ko/common/pio-remote.md:13` | email | ` {{[-s\|--share]}} {{exam****************` |
| 306 | tldr-pages/tldr | `pages.ko/common/pio-remote.md:13` | email | ` {{[-s\|--share]}} {{exam****************` |
| 307 | tldr-pages/tldr | `pages.ko/common/poetry-init.md:12` | email | `author "{{author_name <emai*************` |
| 308 | tldr-pages/tldr | `pages.ko/common/poetry-new.md:24` | email | `터리}} --author "{{Name <emai*************` |
| 309 | tldr-pages/tldr | `pages.ko/common/pop.md:12` | email | `{{경로/대상/메시지.md}} --from {{me@e**********` |
| 310 | tldr-pages/tldr | `pages.ko/common/pop.md:12` | email | `{me@example.com}} --to {{you@***********` |
| 311 | tldr-pages/tldr | `pages.ko/common/prosodyctl.md:17` | email | `do prosodyctl adduser {{user************` |
| 312 | tldr-pages/tldr | `pages.ko/common/prosodyctl.md:21` | email | `udo prosodyctl passwd {{user************` |
| 313 | tldr-pages/tldr | `pages.ko/common/prosodyctl.md:25` | email | `do prosodyctl deluser {{user************` |
| 314 | tldr-pages/tldr | `pages.ko/common/resend.md:16` | email | `d emails send --from {{emai*************` |
| 315 | tldr-pages/tldr | `pages.ko/common/resend.md:16` | email | `xample.com}} --to {{reci****************` |
| 316 | tldr-pages/tldr | `pages.ko/common/resend.md:24` | email | ` emails send --to {{reci****************` |
| 317 | tldr-pages/tldr | `pages.ko/common/sendmail.md:10` | email | `메일 서버가 설정되어 있다고 가정하고, you@**************` |
| 318 | tldr-pages/tldr | `pages.ko/common/sendmail.md:10` | email | `정하고, you@yourdomain.com에서 test**********` |
| 319 | tldr-pages/tldr | `pages.ko/common/sendmail.md:12` | email | `'sendmail -f {{you@**************` |
| 320 | tldr-pages/tldr | `pages.ko/common/sendmail.md:12` | email | ` {{you@yourdomain.com}} {{test**********` |
| 321 | tldr-pages/tldr | `pages.ko/common/sendmail.md:14` | email | `메일 서버가 설정되어 있다고 가정하고, you@**************` |
| 322 | tldr-pages/tldr | `pages.ko/common/sendmail.md:14` | email | `정하고, you@yourdomain.com에서 test**********` |
| 323 | tldr-pages/tldr | `pages.ko/common/sendmail.md:16` | email | `'sendmail -f {{you@**************` |
| 324 | tldr-pages/tldr | `pages.ko/common/sendmail.md:16` | email | ` {{you@yourdomain.com}} {{test**********` |
| 325 | tldr-pages/tldr | `pages.ko/linux/alpine.md:13` | email | `'alpine {{emai*************` |
| 326 | tldr-pages/tldr | `pages.ko/linux/exiqgrep.md:8` | email | `'exiqgrep -f '<{{emai****************` |
| 327 | tldr-pages/tldr | `pages.ko/linux/exiqgrep.md:12` | email | `'exiqgrep -i -f '<{{emai****************` |
| 328 | tldr-pages/tldr | `pages.ko/linux/exiqgrep.md:16` | email | `'exiqgrep -r '{{emai****************` |
| 329 | tldr-pages/tldr | `pages.ko/linux/exiqgrep.md:20` | email | `'exiqgrep -i -f '<{{emai****************` |
| 330 | tldr-pages/tldr | `pages.ko/linux/swaks.md:6` | email | `r.example.net'의 포트 25에 'user************` |
| 331 | tldr-pages/tldr | `pages.ko/linux/swaks.md:8` | email | `'swaks {{[-t\|--to]}} {{user************` |
| 332 | tldr-pages/tldr | `pages.ko/linux/swaks.md:10` | email | `- 사용자 'me@e**********` |
| 333 | tldr-pages/tldr | `pages.ko/linux/swaks.md:12` | email | `'swaks {{[-t\|--to]}} {{user************` |
| 334 | tldr-pages/tldr | `pages.ko/linux/swaks.md:12` | email | `e.com}} {{[-f\|--from]}} {{me@e**********` |
| 335 | tldr-pages/tldr | `pages.ko/linux/swaks.md:12` | email | `} {{[-au\|--auth-user]}} {{me@e**********` |
| 336 | tldr-pages/tldr | `pages.ko/linux/swaks.md:16` | email | `'swaks {{[-t\|--to]}} {{user************` |
| 337 | tldr-pages/tldr | `pages.ko/linux/swaks.md:20` | email | `'swaks {{[-t\|--to]}} {{user************` |
| 338 | tldr-pages/tldr | `pages.ko/linux/swaks.md:22` | email | `파일을 통해 LMTP 프로토콜을 사용하여 'user************` |
| 339 | tldr-pages/tldr | `pages.ko/linux/swaks.md:24` | email | `'swaks {{[-t\|--to]}} {{user************` |
| 340 | tldr-pages/tldr | `pages.ko/osx/mas.md:8` | email | `'mas signin "{{user************` |
| 341 | tldr-pages/tldr | `pages.nl/common/az-logout.md:13` | email | `az logout --username {{alia*************` |
| 342 | tldr-pages/tldr | `pages.nl/common/gpg.md:19` | email | `rteken 'doc.txt' voor 'alic*************` |
| 343 | tldr-pages/tldr | `pages.nl/common/gpg.md:19` | email | ` 'alice@example.com' en 'bob@***********` |
| 344 | tldr-pages/tldr | `pages.nl/common/gpg.md:21` | email | `{{[-r\|--recipient]}} {{alic*************` |
| 345 | tldr-pages/tldr | `pages.nl/common/gpg.md:21` | email | `} {{[-r\|--recipient]}} {{bob@***********` |
| 346 | tldr-pages/tldr | `pages.nl/common/gpg.md:33` | email | `'gpg --locate-keys {{alic*************` |
| 347 | tldr-pages/tldr | `pages.nl/common/gpg.md:35` | email | `eke/privésleutel voor 'alic*************` |
| 348 | tldr-pages/tldr | `pages.nl/common/gpg.md:37` | email | `s}} {{[-a\|--armor]}} {{alic*************` |
| 349 | tldr-pages/tldr | `pages.nl/common/mail.md:13` | email | `{onderwerpregel}}" {{to_u***************` |
| 350 | tldr-pages/tldr | `pages.nl/common/mail.md:17` | email | `estandsnaam.txt}}" {{to_u***************` |
| 351 | tldr-pages/tldr | `pages.nl/common/mail.md:21` | email | `{onderwerpregel}}" {{to_u***************` |
| 352 | tldr-pages/tldr | `pages.nl/common/pio-remote.md:13` | email | ` {{[-s\|--share]}} {{exam****************` |
| 353 | tldr-pages/tldr | `pages.nl/common/pio-remote.md:13` | email | ` {{[-s\|--share]}} {{exam****************` |
| 354 | tldr-pages/tldr | `pages.nl/common/sq.md:29` | email | `name {{naam}} --email {{naam************` |
| 355 | tldr-pages/tldr | `pages.pt_BR/common/aws-google-auth.md:8` | email | `{[-u\|--username]}} {{exem***************` |
| 356 | tldr-pages/tldr | `pages.pt_BR/common/aws-google-auth.md:12` | email | `{[-u\|--username]}} {{exam***************` |
| 357 | tldr-pages/tldr | `pages.pt_BR/common/aws-google-auth.md:16` | email | `{[-u\|--username]}} {{exam***************` |
| 358 | tldr-pages/tldr | `pages.pt_BR/common/git-config.md:9` | email | `r.email}} "{{Seu nome\|e-ma**************` |
| 359 | tldr-pages/tldr | `pages.pt_BR/common/gpg.md:15` | email | ` assina 'doc.txt' para alic*************` |
| 360 | tldr-pages/tldr | `pages.pt_BR/common/gpg.md:15` | email | `para alice@example.com e bob@***********` |
| 361 | tldr-pages/tldr | `pages.pt_BR/common/gpg.md:17` | email | `{{[-r\|--recipient]}} {{alic*************` |
| 362 | tldr-pages/tldr | `pages.pt_BR/common/gpg.md:17` | email | `} {{[-r\|--recipient]}} {{bob@***********` |
| 363 | tldr-pages/tldr | `pages.pt_BR/common/gpg.md:31` | email | `rta a chave pública da alic*************` |
| 364 | tldr-pages/tldr | `pages.pt_BR/common/gpg.md:33` | email | `ort {{[-a\|--armor]}} {{alic*************` |
| 365 | tldr-pages/tldr | `pages.pt_BR/common/gpg.md:35` | email | `porta chave privada da alic*************` |
| 366 | tldr-pages/tldr | `pages.pt_BR/common/gpg.md:37` | email | `eys {{[-a\|--armor]}} {{alic*************` |
| 367 | tldr-pages/tldr | `pages.pt_BR/linux/alpine.md:13` | email | `'alpine {{emai*************` |
| 368 | tldr-pages/tldr | `pages.ro/common/git-blame-someone-else.md:8` | email | `omeone-else "{{autor <cine**************` |
| 369 | tldr-pages/tldr | `pages.tr/common/git-check-mailmap.md:8` | email | `'git check-mailmap {{örnek************` |
| 370 | tldr-pages/tldr | `pages.zh/common/git-blame-someone-else.md:8` | email | `-someone-else "{{作者 <some***************` |
| 371 | tldr-pages/tldr | `pages.zh/common/gpg.md:15` | email | `- 为接收者 alic*************` |
| 372 | tldr-pages/tldr | `pages.zh/common/gpg.md:15` | email | `为接收者 alice@example.com 和 bob@***********` |
| 373 | tldr-pages/tldr | `pages.zh/common/gpg.md:17` | email | `{{[-r\|--recipient]}} {{alic*************` |
| 374 | tldr-pages/tldr | `pages.zh/common/gpg.md:17` | email | `} {{[-r\|--recipient]}} {{bob@***********` |
| 375 | tldr-pages/tldr | `pages.zh/common/gpg.md:31` | email | `- 导出 alic*************` |
| 376 | tldr-pages/tldr | `pages.zh/common/gpg.md:33` | email | `ort {{[-a\|--armor]}} {{alic*************` |
| 377 | tldr-pages/tldr | `pages.zh/common/gpg.md:35` | email | `- 导出 alic*************` |
| 378 | tldr-pages/tldr | `pages.zh/common/gpg.md:37` | email | `eys {{[-a\|--armor]}} {{alic*************` |
| 379 | tldr-pages/tldr | `pages.zh/osx/mas.md:8` | email | `'mas signin "{{user************` |
| 380 | tldr-pages/tldr | `pages.zh_TW/common/az-logout.md:13` | email | `logout --username {{alia****************` |
| 381 | tldr-pages/tldr | `pages/common/aws-google-auth.md:8` | email | `{[-u\|--username]}} {{exam***************` |
| 382 | tldr-pages/tldr | `pages/common/aws-google-auth.md:12` | email | `{[-u\|--username]}} {{exam***************` |
| 383 | tldr-pages/tldr | `pages/common/aws-google-auth.md:16` | email | `{[-u\|--username]}} {{exam***************` |
| 384 | tldr-pages/tldr | `pages/common/aws-sns.md:20` | phone | `pic-name"\|--phone-number +1-5***********` |
| 385 | tldr-pages/tldr | `pages/common/az-logout.md:13` | email | `az logout --username {{alia*************` |
| 386 | tldr-pages/tldr | `pages/common/bgpgrep.md:21` | phone | `master6.mrt.bz2}} -aspath '{{6449*******` |
| 387 | tldr-pages/tldr | `pages/common/from.md:20` | email | `'from --sender={{me@e**********` |
| 388 | tldr-pages/tldr | `pages/common/git-blame-someone-else.md:8` | email | `eone-else "{{author <some***************` |
| 389 | tldr-pages/tldr | `pages/common/git-check-mailmap.md:8` | email | `'git check-mailmap {{emai*************` |
| 390 | tldr-pages/tldr | `pages/common/git-check-mailmap.md:12` | email | `ile {{path/to/file}} {{emai*************` |
| 391 | tldr-pages/tldr | `pages/common/git-coauthor.md:9` | email | `git coauthor {{name}} {{name************` |
| 392 | tldr-pages/tldr | `pages/common/git-config.md:9` | email | `r.email}} "{{Your Name\|emai*************` |
| 393 | tldr-pages/tldr | `pages/common/git-reauthor.md:9` | email | `r {{[-o\|--old-email]}} {{old@***********` |
| 394 | tldr-pages/tldr | `pages/common/git-reauthor.md:9` | email | `[-e\|--correct-email]}} {{new@***********` |
| 395 | tldr-pages/tldr | `pages/common/git-reauthor.md:13` | email | `r {{[-o\|--old-email]}} {{old@***********` |
| 396 | tldr-pages/tldr | `pages/common/git-reauthor.md:17` | email | `-e\|--correct-email]}} {{name************` |
| 397 | tldr-pages/tldr | `pages/common/gopass.md:36` | email | `e_name\|path/to/directory\|emai***********` |
| 398 | tldr-pages/tldr | `pages/common/gpg.md:19` | email | `nd sign 'doc.txt' for 'alic*************` |
| 399 | tldr-pages/tldr | `pages/common/gpg.md:19` | email | `'alice@example.com' and 'bob@***********` |
| 400 | tldr-pages/tldr | `pages/common/gpg.md:21` | email | `{{[-r\|--recipient]}} {{alic*************` |
| 401 | tldr-pages/tldr | `pages/common/gpg.md:21` | email | `} {{[-r\|--recipient]}} {{bob@***********` |
| 402 | tldr-pages/tldr | `pages/common/gpg.md:33` | email | `'gpg --locate-keys {{alic*************` |
| 403 | tldr-pages/tldr | `pages/common/gpg.md:35` | email | `ublic/private key for 'alic*************` |
| 404 | tldr-pages/tldr | `pages/common/gpg.md:37` | email | `s}} {{[-a\|--armor]}} {{alic*************` |
| 405 | tldr-pages/tldr | `pages/common/gyb.md:8` | email | `'gyb --email {{emai***********` |
| 406 | tldr-pages/tldr | `pages/common/gyb.md:12` | email | `'gyb --email {{emai***********` |
| 407 | tldr-pages/tldr | `pages/common/gyb.md:16` | email | `'gyb --email {{emai***********` |
| 408 | tldr-pages/tldr | `pages/common/gyb.md:20` | email | `'gyb --email {{emai***********` |
| 409 | tldr-pages/tldr | `pages/common/holehe.md:8` | email | `'holehe {{user****************` |
| 410 | tldr-pages/tldr | `pages/common/holehe.md:12` | email | `'holehe {{user****************` |
| 411 | tldr-pages/tldr | `pages/common/jj-gerrit.md:29` | email | `upload --reviewer {{revi****************` |
| 412 | tldr-pages/tldr | `pages/common/jj-gerrit.md:29` | email | `ewer@example.com}} --cc {{cc@e**********` |
| 413 | tldr-pages/tldr | `pages/common/mail.md:13` | email | `"{{subject line}}" {{to_u***************` |
| 414 | tldr-pages/tldr | `pages/common/mail.md:17` | email | `ME filename.txt}}" {{to_u***************` |
| 415 | tldr-pages/tldr | `pages/common/mail.md:21` | email | `"{{subject_line}}" {{to_u***************` |
| 416 | tldr-pages/tldr | `pages/common/msmtp.md:9` | email | `{Hello world}}" \| msmtp {{to@e**********` |
| 417 | tldr-pages/tldr | `pages/common/msmtp.md:13` | email | `ccount={{account_name}} {{to@e**********` |
| 418 | tldr-pages/tldr | `pages/common/msmtp.md:17` | email | `--port={{999}} --from={{from************` |
| 419 | tldr-pages/tldr | `pages/common/msmtp.md:17` | email | `om={{from@example.org}} {{to@e**********` |
| 420 | tldr-pages/tldr | `pages/common/mu.md:8` | email | `ectory}} --my-address={{name************` |
| 421 | tldr-pages/tldr | `pages/common/mutt.md:12` | email | `'mutt -s {{subject}} -c {{cc@e**********` |
| 422 | tldr-pages/tldr | `pages/common/mutt.md:12` | email | `{cc@example.com}} {{reci****************` |
| 423 | tldr-pages/tldr | `pages/common/mutt.md:16` | email | `e1 file2 ...}} -- {{reci****************` |
| 424 | tldr-pages/tldr | `pages/common/mutt.md:20` | email | ` {{path/to/file}} {{reci****************` |
| 425 | tldr-pages/tldr | `pages/common/mutt.md:24` | email | ` {{path/to/file}} {{reci****************` |
| 426 | tldr-pages/tldr | `pages/common/neomutt.md:12` | email | `utt -s "{{subject}}" -c {{cc@e**********` |
| 427 | tldr-pages/tldr | `pages/common/neomutt.md:12` | email | `{cc@example.com}} {{reci****************` |
| 428 | tldr-pages/tldr | `pages/common/neomutt.md:16` | email | `to/file2 ...}} -- {{reci****************` |
| 429 | tldr-pages/tldr | `pages/common/neomutt.md:20` | email | ` {{path/to/file}} {{reci****************` |
| 430 | tldr-pages/tldr | `pages/common/neomutt.md:24` | email | ` {{path/to/file}} {{reci****************` |
| 431 | tldr-pages/tldr | `pages/common/openclaw-message.md:8` | phone | `age send {{[-t\|--target]}} {{+123*******` |
| 432 | tldr-pages/tldr | `pages/common/openclaw.md:18` | phone | `age send {{[-t\|--target]}} {{+123*******` |
| 433 | tldr-pages/tldr | `pages/common/pio-remote.md:13` | email | ` {{[-s\|--share]}} {{exam****************` |
| 434 | tldr-pages/tldr | `pages/common/pio-remote.md:13` | email | ` {{[-s\|--share]}} {{exam****************` |
| 435 | tldr-pages/tldr | `pages/common/poetry-init.md:12` | email | `author "{{author_name <emai*************` |
| 436 | tldr-pages/tldr | `pages/common/poetry-new.md:24` | email | `ry}} --author "{{Name <emai*************` |
| 437 | tldr-pages/tldr | `pages/common/pop.md:12` | email | `/to/message.md}} --from {{me@e**********` |
| 438 | tldr-pages/tldr | `pages/common/pop.md:12` | email | `{me@example.com}} --to {{you@***********` |
| 439 | tldr-pages/tldr | `pages/common/prosodyctl.md:17` | email | `do prosodyctl adduser {{user************` |
| 440 | tldr-pages/tldr | `pages/common/prosodyctl.md:21` | email | `udo prosodyctl passwd {{user************` |
| 441 | tldr-pages/tldr | `pages/common/prosodyctl.md:25` | email | `do prosodyctl deluser {{user************` |
| 442 | tldr-pages/tldr | `pages/common/resend.md:16` | email | `d emails send --from {{emai*************` |
| 443 | tldr-pages/tldr | `pages/common/resend.md:16` | email | `xample.com}} --to {{reci****************` |
| 444 | tldr-pages/tldr | `pages/common/resend.md:24` | email | ` emails send --to {{reci****************` |
| 445 | tldr-pages/tldr | `pages/common/sendmail.md:10` | email | `- Send an email from 'send**************` |
| 446 | tldr-pages/tldr | `pages/common/sendmail.md:10` | email | `gured for this) to 'rece****************` |
| 447 | tldr-pages/tldr | `pages/common/sendmail.md:12` | email | `mail < message.txt -f send**************` |
| 448 | tldr-pages/tldr | `pages/common/sendmail.md:12` | email | ` sender@example.com rece****************` |
| 449 | tldr-pages/tldr | `pages/common/sendmail.md:14` | email | `- Send an email from 'send**************` |
| 450 | tldr-pages/tldr | `pages/common/sendmail.md:14` | email | `gured for this) to 'rece****************` |
| 451 | tldr-pages/tldr | `pages/common/sendmail.md:16` | email | `endmail < file.zip -f send**************` |
| 452 | tldr-pages/tldr | `pages/common/sendmail.md:16` | email | ` sender@example.com rece****************` |
| 453 | tldr-pages/tldr | `pages/common/spfquery.md:8` | email | `{{8.8.8.8}} -sender {{send**************` |
| 454 | tldr-pages/tldr | `pages/common/spfquery.md:12` | email | `{{8.8.8.8}} -sender {{send**************` |
| 455 | tldr-pages/tldr | `pages/common/sq.md:29` | email | `name {{name}} --email {{name************` |
| 456 | tldr-pages/tldr | `pages/common/stripe.md:25` | email | `omers create --email "{{test************` |
| 457 | tldr-pages/tldr | `pages/linux/alpine.md:13` | email | `'alpine {{emai*************` |
| 458 | tldr-pages/tldr | `pages/linux/exiqgrep.md:8` | email | `'exiqgrep -f '<{{emai*************` |
| 459 | tldr-pages/tldr | `pages/linux/exiqgrep.md:12` | email | `'exiqgrep -i -f '<{{emai*************` |
| 460 | tldr-pages/tldr | `pages/linux/exiqgrep.md:16` | email | `'exiqgrep -r '{{emai*************` |
| 461 | tldr-pages/tldr | `pages/linux/exiqgrep.md:20` | email | `'exiqgrep -i -f '<{{emai*************` |
| 462 | tldr-pages/tldr | `pages/linux/ltrace.md:16` | email | `'ltrace -e mall****************` |
| 463 | tldr-pages/tldr | `pages/linux/swaks.md:6` | email | `standard test email to 'user************` |
| 464 | tldr-pages/tldr | `pages/linux/swaks.md:8` | email | `'swaks {{[-t\|--to]}} {{user************` |
| 465 | tldr-pages/tldr | `pages/linux/swaks.md:10` | email | `5 authentication as user 'me@e**********` |
| 466 | tldr-pages/tldr | `pages/linux/swaks.md:12` | email | `'swaks {{[-t\|--to]}} {{user************` |
| 467 | tldr-pages/tldr | `pages/linux/swaks.md:12` | email | `e.com}} {{[-f\|--from]}} {{me@e**********` |
| 468 | tldr-pages/tldr | `pages/linux/swaks.md:12` | email | `} {{[-au\|--auth-user]}} {{me@e**********` |
| 469 | tldr-pages/tldr | `pages/linux/swaks.md:16` | email | `'swaks {{[-t\|--to]}} {{user************` |
| 470 | tldr-pages/tldr | `pages/linux/swaks.md:20` | email | `'swaks {{[-t\|--to]}} {{user************` |
| 471 | tldr-pages/tldr | `pages/linux/swaks.md:22` | email | `standard test email to 'user************` |
| 472 | tldr-pages/tldr | `pages/linux/swaks.md:24` | email | `'swaks {{[-t\|--to]}} {{user************` |
| 473 | tldr-pages/tldr | `pages/osx/mas.md:8` | email | `'mas signin "{{user************` |
| 474 | twbs/bootstrap | `CODE_OF_CONDUCT.md:63` | email | `mdo@****************` |
| 475 | twbs/bootstrap | `SECURITY.md:5` | email | `urity issue, email [secu****************` |
| 476 | twbs/bootstrap | `SECURITY.md:5` | email | `otstrap.com](mailto:secu****************` |
| 477 | twbs/bootstrap | `composer.json:18` | email | `      "email": "mark***************` |
| 478 | twbs/bootstrap | `composer.json:22` | email | `      "email": "jaco****************` |
| 479 | twbs/bootstrap | `js/tests/unit/util/sanitizer.spec.js:22` | email | `        'mailto:me@e**********` |
| 480 | twbs/bootstrap | `js/tests/unit/util/sanitizer.spec.js:24` | phone | `        'tel:123-********` |
| 481 | twbs/bootstrap | `js/tests/unit/util/sanitizer.spec.js:25` | phone | `        'TEL:123-********` |
| 482 | twbs/bootstrap | `js/tests/visual/floating-label.html:13` | email | `tingInput" placeholder="name************` |
| 483 | twbs/bootstrap | `js/tests/visual/floating-label.html:17` | email | `ingInput1" placeholder="name************` |
| 484 | twbs/bootstrap | `js/tests/visual/floating-label.html:21` | email | `nputValue" placeholder="name************` |
| 485 | twbs/bootstrap | `js/tests/visual/floating-label.html:21` | email | `ame@example.com" value="test************` |
| 486 | twbs/bootstrap | `js/tests/visual/floating-label.html:25` | email | `putValue1" placeholder="name************` |
| 487 | twbs/bootstrap | `js/tests/visual/floating-label.html:29` | email | `utInvalid" placeholder="name************` |
| 488 | twbs/bootstrap | `js/tests/visual/floating-label.html:29` | email | `ame@example.com" value="test************` |
| 489 | twbs/bootstrap | `js/tests/visual/floating-label.html:33` | email | `tInvalid1" placeholder="name************` |
| 490 | twbs/bootstrap | `js/tests/visual/floating-label.html:33` | email | `ame@example.com" value="test************` |
| 491 | twbs/bootstrap | `js/tests/visual/floating-label.html:37` | email | `tInvalid2" placeholder="name************` |
| 492 | twbs/bootstrap | `js/tests/visual/floating-label.html:41` | email | `tInvalid3" placeholder="name************` |
| 493 | twbs/bootstrap | `js/tests/visual/floating-label.html:113` | email | `tDisabled" placeholder="name************` |
| 494 | twbs/bootstrap | `js/tests/visual/floating-label.html:134` | email | `Disabled1" placeholder="name************` |
| 495 | twbs/bootstrap | `js/tests/visual/floating-label.html:155` | email | `textInput" placeholder="name************` |
| 496 | twbs/bootstrap | `js/tests/visual/floating-label.html:159` | email | `textInput" placeholder="name************` |
| 497 | twbs/bootstrap | `js/tests/visual/floating-label.html:159` | email | `ame@example.com" value="name************` |
| 498 | twbs/bootstrap | `js/tests/visual/floating-label.html:163` | email | `extInput1" placeholder="name************` |
| 499 | twbs/bootstrap | `js/tests/visual/floating-label.html:167` | email | `extInput1" placeholder="name************` |
| 500 | twbs/bootstrap | `js/tests/visual/floating-label.html:203` | email | `ingInput2" placeholder="name************` |
| 501 | twbs/bootstrap | `js/tests/visual/floating-label.html:207` | email | `ingInput3" placeholder="name************` |
| 502 | twbs/bootstrap | `js/tests/visual/floating-label.html:211` | email | `putValue2" placeholder="name************` |
| 503 | twbs/bootstrap | `js/tests/visual/floating-label.html:211` | email | `ame@example.com" value="test************` |
| 504 | twbs/bootstrap | `js/tests/visual/floating-label.html:215` | email | `putValue3" placeholder="name************` |
| 505 | twbs/bootstrap | `js/tests/visual/floating-label.html:219` | email | `tInvalid4" placeholder="name************` |
| 506 | twbs/bootstrap | `js/tests/visual/floating-label.html:219` | email | `ame@example.com" value="test************` |
| 507 | twbs/bootstrap | `js/tests/visual/floating-label.html:223` | email | `tInvalid5" placeholder="name************` |
| 508 | twbs/bootstrap | `js/tests/visual/floating-label.html:223` | email | `ame@example.com" value="test************` |
| 509 | twbs/bootstrap | `js/tests/visual/floating-label.html:227` | email | `tInvalid6" placeholder="name************` |
| 510 | twbs/bootstrap | `js/tests/visual/floating-label.html:231` | email | `tInvalid7" placeholder="name************` |
| 511 | twbs/bootstrap | `js/tests/visual/floating-label.html:303` | email | `Disabled2" placeholder="name************` |
| 512 | twbs/bootstrap | `js/tests/visual/floating-label.html:324` | email | `Disabled3" placeholder="name************` |
| 513 | twbs/bootstrap | `js/tests/visual/floating-label.html:345` | email | `extInput2" placeholder="name************` |
| 514 | twbs/bootstrap | `js/tests/visual/floating-label.html:349` | email | `extInput2" placeholder="name************` |
| 515 | twbs/bootstrap | `js/tests/visual/floating-label.html:349` | email | `ame@example.com" value="name************` |
| 516 | twbs/bootstrap | `js/tests/visual/floating-label.html:353` | email | `extInput3" placeholder="name************` |
| 517 | twbs/bootstrap | `js/tests/visual/floating-label.html:357` | email | `extInput3" placeholder="name************` |
| 518 | twbs/bootstrap | `site/src/assets/examples/cheatsheet-rtl/index.astro:526` | email | `tingInput" placeholder="name************` |
| 519 | twbs/bootstrap | `site/src/assets/examples/cheatsheet/index.astro:507` | email | `tingInput" placeholder="name************` |
| 520 | twbs/bootstrap | `site/src/assets/examples/checkout-rtl/index.astro:100` | email | ` id="email" placeholder="you@***********` |
| 521 | twbs/bootstrap | `site/src/assets/examples/checkout/index.astro:99` | email | ` id="email" placeholder="you@***********` |
| 522 | twbs/bootstrap | `site/src/assets/examples/heroes/index.astro:70` | email | `tingInput" placeholder="name************` |
| 523 | twbs/bootstrap | `site/src/assets/examples/modals/index.astro:118` | email | `tingInput" placeholder="name************` |
| 524 | twbs/bootstrap | `site/src/assets/examples/sign-in/index.astro:15` | email | `tingInput" placeholder="name************` |
| 525 | twbs/bootstrap | `site/src/content/docs/components/dropdowns.mdx:806` | email | `rmEmail1" placeholder="emai*************` |
| 526 | twbs/bootstrap | `site/src/content/docs/components/dropdowns.mdx:834` | email | `rmEmail2" placeholder="emai*************` |
| 527 | twbs/bootstrap | `site/src/content/docs/content/reboot.mdx:257` | email | `id="email" placeholder="test************` |
| 528 | twbs/bootstrap | `site/src/content/docs/content/reboot.mdx:386` | phone | `r title="Phone">P:</abbr> (123**********` |
| 529 | twbs/bootstrap | `site/src/content/docs/content/reboot.mdx:391` | email | `    <a href="mailto:firs****************` |
| 530 | twbs/bootstrap | `site/src/content/docs/content/reboot.mdx:391` | email | `t.last@example.com">firs****************` |
| 531 | twbs/bootstrap | `site/src/content/docs/forms/floating-labels.mdx:16` | email | `tingInput" placeholder="name************` |
| 532 | twbs/bootstrap | `site/src/content/docs/forms/floating-labels.mdx:27` | email | `nputValue" placeholder="name************` |
| 533 | twbs/bootstrap | `site/src/content/docs/forms/floating-labels.mdx:27` | email | `ame@example.com" value="test************` |
| 534 | twbs/bootstrap | `site/src/content/docs/forms/floating-labels.mdx:34` | email | `utInvalid" placeholder="name************` |
| 535 | twbs/bootstrap | `site/src/content/docs/forms/floating-labels.mdx:34` | email | `ame@example.com" value="test************` |
| 536 | twbs/bootstrap | `site/src/content/docs/forms/floating-labels.mdx:73` | email | `tDisabled" placeholder="name************` |
| 537 | twbs/bootstrap | `site/src/content/docs/forms/floating-labels.mdx:99` | email | `textInput" placeholder="name************` |
| 538 | twbs/bootstrap | `site/src/content/docs/forms/floating-labels.mdx:103` | email | `textInput" placeholder="name************` |
| 539 | twbs/bootstrap | `site/src/content/docs/forms/floating-labels.mdx:103` | email | `ame@example.com" value="name************` |
| 540 | twbs/bootstrap | `site/src/content/docs/forms/floating-labels.mdx:139` | email | `InputGrid" placeholder="name************` |
| 541 | twbs/bootstrap | `site/src/content/docs/forms/floating-labels.mdx:139` | email | `name@example.com" value="mdo@***********` |
| 542 | twbs/bootstrap | `site/src/content/docs/forms/form-control.mdx:13` | email | `rolInput1" placeholder="name************` |
| 543 | twbs/bootstrap | `site/src/content/docs/forms/form-control.mdx:80` | email | `d="staticEmail" value="emai*************` |
| 544 | twbs/bootstrap | `site/src/content/docs/forms/form-control.mdx:93` | email | `="staticEmail2" value="emai*************` |
| 545 | twbs/bootstrap | `site/src/content/docs/utilities/borders.mdx:52` | email | `rolInput1" placeholder="name************` |
| 546 | highlightjs/cdn-release | `build/highlight.js:2520` | email | `    Author: vah <vaht****************` |
| 547 | highlightjs/cdn-release | `build/highlight.js:2521` | email | `: Benjamin Pannell <cont****************` |
| 548 | highlightjs/cdn-release | `build/highlight.js:3614` | email | `uthor: Jason Diamond <jaso**************` |
| 549 | highlightjs/cdn-release | `build/highlight.js:3615` | email | `tor: Nicolas LLOBERA <nllo**************` |
| 550 | highlightjs/cdn-release | `build/highlight.js:3615` | email | `>, Pieter Vantorre <piet****************` |
| 551 | highlightjs/cdn-release | `build/highlight.js:3615` | email | `l.com>, David Pine <davi****************` |
| 552 | highlightjs/cdn-release | `build/highlight.js:4645` | email | `or: Vasily Polovnyov <vast**************` |
| 553 | highlightjs/cdn-release | `build/highlight.js:4706` | email | `han Kountso aka StepLg <step************` |
| 554 | highlightjs/cdn-release | `build/highlight.js:4707` | email | `s: Evgeny Stepanischev <imbo************` |
| 555 | highlightjs/cdn-release | `build/highlight.js:4843` | email | `s: Guillaume Gomez <guil****************` |
| 556 | highlightjs/cdn-release | `build/highlight.js:5004` | email | ` Vsevolod Solovyov <vsev****************` |
| 557 | highlightjs/cdn-release | `build/highlight.js:5911` | email | `hor: Ivan Sagalaev <mani****************` |
| 558 | highlightjs/cdn-release | `build/highlight.js:5958` | email | `hor: Sergey Mashkov <cy6e***************` |
| 559 | highlightjs/cdn-release | `build/highlight.js:6206` | email | `r:   Max Mikhailov <seve****************` |
| 560 | highlightjs/cdn-release | `build/highlight.js:6441` | email | `  Author: Andrew Fedorov <dmmd**********` |
| 561 | highlightjs/cdn-release | `build/highlight.js:6521` | email | `hor: Ivan Sagalaev <mani****************` |
| 562 | highlightjs/cdn-release | `build/highlight.js:6522` | email | `ributors: Joël Porquet <joel************` |
| 563 | highlightjs/cdn-release | `build/highlight.js:6845` | email | `hor: John Crepezzi <john****************` |
| 564 | highlightjs/cdn-release | `build/highlight.js:7076` | email | `hor: Valerii Hiora <vale****************` |
| 565 | highlightjs/cdn-release | `build/highlight.js:7077` | email | `: Angel G. Olloqui <ange****************` |
| 566 | highlightjs/cdn-release | `build/highlight.js:7077` | email | `com>, Matt Diephouse <matt**************` |
| 567 | highlightjs/cdn-release | `build/highlight.js:7077` | email | `.com>, Andrew Farmer <ahfa**************` |
| 568 | highlightjs/cdn-release | `build/highlight.js:7077` | email | `er@gmail.com>, Minh Nguyễn <mxn@********` |
| 569 | highlightjs/cdn-release | `build/highlight.js:7325` | email | `  Author: Peter Leonov <gojp************` |
| 570 | highlightjs/cdn-release | `build/highlight.js:7802` | email | `r: Victor Karamzin <Vict****************` |
| 571 | highlightjs/cdn-release | `build/highlight.js:7803` | email | `s: Evgeny Stepanischev <imbo************` |
| 572 | highlightjs/cdn-release | `build/highlight.js:7803` | email | `om>, Ivan Sagalaev <mani****************` |
| 573 | highlightjs/cdn-release | `build/highlight.js:8005` | email | `uthor: Josh Goebel <hell****************` |
| 574 | highlightjs/cdn-release | `build/highlight.js:8057` | email | `Author: Egor Rogov (e.ro****************` |
| 575 | highlightjs/cdn-release | `build/highlight.js:8498` | email | `uthor: Josh Goebel <hell****************` |
| 576 | highlightjs/cdn-release | `build/highlight.js:8533` | email | `    Author: Joe Cheng <joe@***********` |
| 577 | highlightjs/cdn-release | `build/highlight.js:8534` | email | `rs: Konrad Rudolph <konr****************` |
| 578 | highlightjs/cdn-release | `build/highlight.js:8717` | email | `thor: Anton Kovalyov <anto**************` |
| 579 | highlightjs/cdn-release | `build/highlight.js:8718` | email | `ributors: Peter Leonov <gojp************` |
| 580 | highlightjs/cdn-release | `build/highlight.js:8718` | email | `u>, Vasily Polovnyov <vast**************` |
| 581 | highlightjs/cdn-release | `build/highlight.js:8718` | email | `teants.net>, Loren Segal <lseg**********` |
| 582 | highlightjs/cdn-release | `build/highlight.js:8718` | email | `.ca>, Pascal Hurni <phi@****************` |
| 583 | highlightjs/cdn-release | `build/highlight.js:8718` | email | `>, Cedric Sohrauer <sohr****************` |
| 584 | highlightjs/cdn-release | `build/highlight.js:9070` | email | `Andrey Vlasovskikh <andr****************` |
| 585 | highlightjs/cdn-release | `build/highlight.js:9071` | email | `ors: Roman Shmatov <roma****************` |
| 586 | highlightjs/cdn-release | `build/highlight.js:9071` | email | `>, Kasper Andersen <kma_****************` |
| 587 | highlightjs/cdn-release | `build/highlight.js:9385` | email | `    Author: Kurt Emch <kurt*************` |
| 588 | highlightjs/cdn-release | `build/highlight.js:9503` | email | ` TSUYUSATO Kitsune <make****************` |
| 589 | highlightjs/cdn-release | `build/highlight.js:10512` | email | `r: Steven Van Impe <stev****************` |
| 590 | highlightjs/cdn-release | `build/highlight.js:10513` | email | `tributors: Chris Eidhof <chri***********` |
| 591 | highlightjs/cdn-release | `build/highlight.js:10513` | email | `idhof.nl>, Nate Cook <nate**************` |
| 592 | highlightjs/cdn-release | `build/highlight.js:10513` | email | `.com>, Alexander Lichter <mann**********` |
| 593 | highlightjs/cdn-release | `build/highlight.js:11010` | email | `: Panu Horsmalahti <panu****************` |
| 594 | highlightjs/cdn-release | `build/highlight.js:11011` | email | `  Contributors: Ike Ku <demp************` |
| 595 | highlightjs/cdn-release | `build/highlight.js:11105` | email | `hors: Poren Chiang <ren.****************` |
| 596 | highlightjs/cdn-release | `build/highlight.js:11281` | email | `hor: Stefan Wienert <stwi***************` |
| 597 | highlightjs/cdn-release | `build/highlight.js:11282` | email | `ontributors: Carl Baxter <carl**********` |
| 598 | highlightjs/cdn-release | `build/package.json:12` | email | `      "email": "mani****************` |
| 599 | highlightjs/cdn-release | `build/package.json:15` | email | `      "Josh Goebel <hell****************` |
| 600 | highlightjs/cdn-release | `build/package.json:16` | email | `      "Egor Rogov <e.ro****************` |
| 601 | highlightjs/cdn-release | `build/package.json:17` | email | `      "Vladimir Jimenez <me@a********` |
| 602 | highlightjs/cdn-release | `build/package.json:18` | email | `    "Ivan Sagalaev <mani****************` |
| 603 | highlightjs/cdn-release | `build/package.json:19` | email | `      "Jeremy Hull <sour***************` |
| 604 | highlightjs/cdn-release | `build/package.json:20` | email | `      "Oleg Efimov <efim**************` |
| 605 | highlightjs/cdn-release | `build/package.json:21` | email | `      "Gidi Meir Morris <gidi********` |
| 606 | highlightjs/cdn-release | `build/package.json:22` | email | `      "Jan T. Sott <git@************` |
| 607 | highlightjs/cdn-release | `build/package.json:23` | email | `      "Li Xuanji <xuan************` |
| 608 | highlightjs/cdn-release | `build/package.json:24` | email | `     "Marcos Cáceres <marc**************` |
| 609 | highlightjs/cdn-release | `build/package.json:25` | email | `      "Sang Dang <sang**************` |
| 610 | highlightjs/cdn-release | `build/styles/agate.min.css:3` | email | `) Taufik Nurrohman <hi@t****************` |
| 611 | highlightjs/cdn-release | `build/styles/an-old-hope.min.css:3` | email | ` (c) Gustavo Costa <gusb****************` |
| 612 | highlightjs/cdn-release | `build/styles/base16/brush-trees-dark.min.css:3` | email | `hor: Abraham White <abel****************` |
| 613 | highlightjs/cdn-release | `build/styles/base16/brush-trees.min.css:3` | email | `hor: Abraham White <abel****************` |
| 614 | highlightjs/cdn-release | `build/styles/base16/danqing.min.css:3` | email | `enhan Zhu (Cosmos) (zhuw****************` |
| 615 | highlightjs/cdn-release | `build/styles/base16/gruvbox-dark-hard.min.css:3` | email | `  Author: Dawid Kurek (dawi*************` |
| 616 | highlightjs/cdn-release | `build/styles/base16/gruvbox-dark-medium.min.css:3` | email | `  Author: Dawid Kurek (dawi*************` |
| 617 | highlightjs/cdn-release | `build/styles/base16/gruvbox-dark-pale.min.css:3` | email | `  Author: Dawid Kurek (dawi*************` |
| 618 | highlightjs/cdn-release | `build/styles/base16/gruvbox-dark-soft.min.css:3` | email | `  Author: Dawid Kurek (dawi*************` |
| 619 | highlightjs/cdn-release | `build/styles/base16/gruvbox-light-hard.min.css:3` | email | `  Author: Dawid Kurek (dawi*************` |
| 620 | highlightjs/cdn-release | `build/styles/base16/gruvbox-light-medium.min.css:3` | email | `  Author: Dawid Kurek (dawi*************` |
| 621 | highlightjs/cdn-release | `build/styles/base16/gruvbox-light-soft.min.css:3` | email | `  Author: Dawid Kurek (dawi*************` |
| 622 | highlightjs/cdn-release | `build/styles/base16/heetch-dark.min.css:3` | email | `Author: Geoffrey Teale (teal************` |
| 623 | highlightjs/cdn-release | `build/styles/base16/heetch-light.min.css:3` | email | `Author: Geoffrey Teale (teal************` |
| 624 | highlightjs/cdn-release | `build/styles/base16/ros-pine-dawn.min.css:3` | email | `Author: Emilia Dunfelt <sayh************` |
| 625 | highlightjs/cdn-release | `build/styles/base16/ros-pine-moon.min.css:3` | email | `Author: Emilia Dunfelt <sayh************` |
| 626 | highlightjs/cdn-release | `build/styles/base16/ros-pine.min.css:3` | email | `Author: Emilia Dunfelt <sayh************` |
| 627 | highlightjs/cdn-release | `build/styles/default.min.css:4` | email | ` (c) Ivan Sagalaev <mani****************` |
| 628 | auth0/node-jsonwebtoken | `LICENSE:3` | email | ` (c) 2015 Auth0, Inc. <supp*************` |
| 629 | panva/jose | `CODE_OF_CONDUCT.md:63` | email | `panv**************` |
| 630 | panva/jose | `cookbook/jwe.mjs:11` | email | `        kid: 'samw****************` |
| 631 | panva/jose | `cookbook/jwe.mjs:34` | email | `        kid: 'samw****************` |
| 632 | panva/jose | `cookbook/jwe.mjs:131` | email | `        kid: 'pere****************` |
| 633 | panva/jose | `cookbook/jwe.mjs:157` | email | `        kid: 'pere****************` |
| 634 | panva/jose | `cookbook/jwe.mjs:203` | email | `        kid: 'meri****************` |
| 635 | panva/jose | `cookbook/jwe.mjs:229` | email | `        kid: 'meri****************` |
| 636 | panva/jose | `cookbook/jws.mjs:11` | email | `        kid: 'bilb****************` |
| 637 | panva/jose | `cookbook/jws.mjs:27` | email | `        kid: 'bilb****************` |
| 638 | panva/jose | `cookbook/jws.mjs:101` | email | `        kid: 'bilb****************` |
| 639 | panva/jose | `cookbook/jws.mjs:117` | email | `        kid: 'bilb****************` |
| 640 | panva/jose | `cookbook/jws.mjs:151` | email | `        kid: 'bilb****************` |
| 641 | panva/jose | `cookbook/jws.mjs:163` | email | `        kid: 'bilb****************` |
| 642 | panva/jose | `package.json:62` | email | `thor": "Filip Skokan <panv**************` |
| 643 | motdotla/dotenv | `SECURITY.md:1` | email | ` vulnerabilities to secu****************` |
| 644 | motdotla/dotenv | `package-lock.json:8967` | email | `exorbitant rates) by contacting i@iz****` |
| 645 | motdotla/dotenv | `scripts/parse-perf.js:30` | email | `  'EMAIL_FROM="MyApp <nore*************` |
| 646 | motdotla/dotenv | `tests/.env:37` | email | `USERNAME=ther****************` |
| 647 | motdotla/dotenv | `tests/.env-multiline:19` | email | `USERNAME=ther****************` |
| 648 | motdotla/dotenv | `tests/.env.multiline:19` | email | `USERNAME=ther****************` |
| 649 | motdotla/dotenv | `tests/test-parse-multiline.js:40` | email | `l(parsed.USERNAME, 'ther****************` |
| 650 | motdotla/dotenv | `tests/test-parse.js:78` | email | `l(parsed.USERNAME, 'ther****************` |
