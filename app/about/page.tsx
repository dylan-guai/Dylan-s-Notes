import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About Dylan Guai.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[680px] space-y-6">
      <h1 className="font-serif text-2xl font-semibold tracking-tight">About</h1>

      <div className="prose max-w-none">
        <p>
          I&rsquo;m Dylan Guai, a final-year Computing student at the National
          University of Singapore (AI &amp; FinTech). I&rsquo;m interested in
          venture and private markets in emerging technology &mdash; and in
          being the kind of investor who can technically underwrite what he
          backs.
        </p>
        <p>
          This site is where I publish independent{" "}
          <a href="/research">research</a> &mdash; a series on physical &amp;
          embodied AI, read through one recurring lens, the demo-to-deployable
          gap &mdash; alongside notes from my{" "}
          <a href="/internships">internships</a>, a few{" "}
          <a href="/fieldnotes">fieldnotes</a> from life outside the work, and a{" "}
          <a href="/reading">reading library</a>.
        </p>
        <p>Say hello:</p>
        <ul>
          {/* TODO: replace these with your real links. */}
          <li>
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a href="mailto:you@example.com">Email</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
