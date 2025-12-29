import ContactForm from '@/components/ContactForm';
import styles from '@/styles/Contact.module.css';

export default function ContactPage() {
  return (
    <div className={styles.contactPage}>
      <h1>Contact Us</h1>
      <p>Get in touch with us. We&apos;d love to hear from you!</p>
      <ContactForm />
    </div>
  );
}
