const About = () => {
  return (
    <section class="mx-auto max-w-3xl py-8">
      <h1 class="text-3xl font-semibold tracking-normal">About Teledeck</h1>
      <div class="mt-5 space-y-4 text-base leading-7 text-[rgb(var(--color-muted))]">
        <p>
          Teledeck is a media gallery for browsing, filtering, and managing media collected from Telegram channels.
        </p>
        <p>
          This frontend is being rebuilt with SolidJS, Solid Query, and Tailwind so the app can stay fast, compact,
          and easy to reshape.
        </p>
      </div>
    </section>
  );
};

export default About;
