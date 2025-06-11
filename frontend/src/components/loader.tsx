const Loader = () => {
  return (
    <div className="fixed top-0 left-0 z-[99999999] flex h-dvh w-screen items-center justify-center overflow-hidden bg-white">
      <div className="three-body">
        <div className="three-body__dot" />
        <div className="three-body__dot" />
        <div className="three-body__dot" />
      </div>
    </div>
  );
};

export default Loader;
