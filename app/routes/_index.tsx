import { useNavigate } from "react-router";

import { LandingHero } from "~/components/landing";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleSubmit = (prompt: string) => {
    navigate(`/email-signup?prompt=${encodeURIComponent(prompt)}`);
  };

  return <LandingHero onSubmit={handleSubmit} />;
}
