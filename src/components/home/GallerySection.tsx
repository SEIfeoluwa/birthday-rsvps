import galleryImageOne from '../../assets/WhatsApp Image 2026-05-25 at 17.13.10.jpeg'
import galleryImageTwo from '../../assets/WhatsApp Image 2026-05-25 at 17.13.10 (1).jpeg'
import galleryImageThree from '../../assets/WhatsApp Image 2026-05-25 at 17.13.10 (2).jpeg'
import galleryImageFour from '../../assets/WhatsApp Image 2026-05-25 at 17.13.10 (3).jpeg'
import galleryImageFive from '../../assets/WhatsApp Image 2026-05-25 at 17.13.11.jpeg'

const galleryImages = [
  { src: galleryImageOne, alt: 'Mr and Mrs Fayemi celebration photo 1' },
  { src: galleryImageTwo, alt: 'Mr and Mrs Fayemi celebration photo 2' },
  { src: galleryImageThree, alt: 'Mr and Mrs Fayemi celebration photo 3' },
  { src: galleryImageFour, alt: 'Mr and Mrs Fayemi celebration photo 4' },
  { src: galleryImageFive, alt: 'Mr and Mrs Fayemi celebration photo 5' },
]

export default function Gallery() {
  return (
    <section className="gallery">
      <h2>Gallery</h2>
      <div className="gallery-grid">
        {galleryImages.map((image) => (
          <img key={image.src} src={image.src} alt={image.alt} />
        ))}
      </div>
    </section>
  )
}
