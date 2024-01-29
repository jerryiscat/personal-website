import React from 'react';
import './Contact.css'; 
import '@fortawesome/fontawesome-free/css/all.css';

function Contact() {
  return (
    <div className="contact">
        <div class="container">
            <div class="row">
                <div class="contact-left">
                    <h1 class="sub-title">Contact Me</h1>
                    <p><i class="fa-solid fa-envelope"></i>jasmine.2002@gmail.com</p>
                    <p><i class="fa-solid fa-phone"></i>2062184652</p>
                    <div class="social-icons">
                        <a href="https://www.linkedin.com/in/jasmine-zhang-a37500233/"><i class="fa-brands fa-linkedin"></i></a>
                        <a href="https://github.com/jerryiscat"><i class="fa-brands fa-github"></i></a>
                    </div>
                    <a href="https://drive.google.com/file/d/1eDx6QIO7iAEht1u__OEgjj6FP3A5r_8S/view?usp=sharing" download class="btn btn2">Download Resume</a>
                </div>
                <div class="contact-right">
                    <form name="submit-to-google-sheet">
                        <input type="text" name="Name" placeholder="Your Name*" required />
                        <input type="email" name="Email" placeholder="Your Email*" required />
                        <textarea name="Message" rows="6" placeholder="Your Message"></textarea>
                        <button type="submit" class="btn btn2 submit">Send</button>
                    </form>
                    <span id="msg"></span>
                </div>
            </div>
        </div>
    </div>
  );
}

export default Contact;
