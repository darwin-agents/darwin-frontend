/* global React, ReactDOM, Hero, Anatomy, WhatItIsNot, Operators, Canvas, Trust, Roadmap, CTA */
function App() {
  return (
    <>
      <div className="grain" />
      <Hero />
      <Anatomy />
      <WhatItIsNot />
      <Operators />
      <Canvas />
      <Trust />
      <Roadmap />
      <CTA />
    </>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
