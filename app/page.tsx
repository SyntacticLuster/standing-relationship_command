import { getChatGPTUser } from "./chatgpt-auth";
import StandingWorkspace from "./StandingWorkspace";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getChatGPTUser();

  return (
    <StandingWorkspace
      displayName={user?.displayName ?? "Operator"}
      email={user?.email ?? null}
    />
  );
}
