const SubscriptionBlocker = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
      <div className="text-center space-y-8">
        <div className="flex justify-center">
          <div className="text-8xl font-bold text-foreground select-none">
            ☹
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold text-foreground tracking-tight">
          Oops!
        </h1>

        <div className="inline-block bg-foreground text-background px-4 py-2">
          <p className="text-sm md:text-base font-semibold tracking-wider">
            ACCESS TEMPORARILY PAUSED
          </p>
        </div>

        <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
          Looks like this page is on a quick pause — a small update to your plan will bring it back to work.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionBlocker;
