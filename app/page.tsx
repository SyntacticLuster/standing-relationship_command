import { getUser } from "./auth";
import StandingWorkspace from "./StandingWorkspace";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getUser();

  return (
    <StandingWorkspace
      displayName={user?.displayName ?? "Operator"}
      email={user?.email ?? null}
    />
  );
}
