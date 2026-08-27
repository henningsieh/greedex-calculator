# Candidate release test gate

Coolify starts each calculator candidate with this command:

```text
pnpm --filter @greendex/calculator run test:candidate && pnpm run start
```

`test:candidate` runs inside the newly created candidate container. It:

1. uses `RELEASE_TEST_DATABASE_URL`, the existing Coolify development database;
2. applies committed Drizzle migrations to that test database;
3. starts the built candidate Next.js application on `127.0.0.1:3001`;
4. waits for `GET /api/rpc/health` on that loopback address;
5. runs the complete calculator `pnpm run test:run` Vitest suite against that
   running candidate (with a five-minute maximum); and
6. stops the temporary candidate test server on success or failure.

Port `3000` remains exclusively for the normal application and Coolify's health
check. The test server uses `3001`, so a hung test can never make an unfinished
candidate look healthy. The command sets `NEXT_PUBLIC_BASE_URL` to the test
server's loopback address. The public hostname is never used as test evidence
before promotion.

The candidate receives normal Coolify environment variables directly. It does
not require `/app/.env`. The normal application `DATABASE_URL` remains the
live Greendex database; `RELEASE_TEST_DATABASE_URL` is a Coolify-managed secret
that must point to the existing development database. Do not put either URL in
source control.

A failed test returns a non-zero exit status. The normal `pnpm run start`
command does not run, so the candidate never becomes healthy and Coolify keeps
the previous release serving traffic. When the test gate passes, the ordinary
`prestart` keeps its existing migration-before-start order for the live
application database. Coolify then checks `GET /api/rpc/health` on port `3000`
before promotion.
