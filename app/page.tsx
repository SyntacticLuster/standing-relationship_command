import { getChatGPTUser } from "./chatgpt-auth";
import SignalWorkspace from "./SignalWorkspace";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getChatGPTUser();

  return (
    <SignalWorkspace
      displayName={user?.displayName ?? "Operator"}
      email={user?.email ?? null}
    />
  );
}
