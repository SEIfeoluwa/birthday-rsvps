import aboutImage from '../../assets/WhatsApp Image 2026-05-25 at 17.13.09.jpeg'

export default function About() {
  return (
    <section className="about">
      <div className="about-content">
        <img src={aboutImage} alt="Mr and Mrs Fayemi" />
        <div>
          <h2>About the Event</h2>
          <p>Join us for a wonderful celebration filled with joy, laughter, and cherished moments with friends and family.</p>
        </div>
      </div>
    </section>
  )
}
