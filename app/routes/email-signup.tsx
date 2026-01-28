import { useNavigate, useSearchParams } from "react-router";

import { EmailSignupForm } from "~/components/signup";
import { useSignupStore } from "~/stores/use-signup-store";

export default function EmailSignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prompt = searchParams.get("prompt") ?? undefined;
  const setEmail = useSignupStore((s) => s.setEmail);
  const setPendingPrompt = useSignupStore((s) => s.setPendingPrompt);

  const handleSubmit = (data: { email: string; password: string }) => {
    setEmail(data.email);
    if (prompt) {
      setPendingPrompt(prompt);
    }
    navigate("/signup");
  };

  return <EmailSignupForm onSubmit={handleSubmit} />;
}
