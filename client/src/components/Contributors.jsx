import React from "react";
import ContactCard from "./ContactCard";
import i1 from "../assets/neem.jpg";
import i2 from "../assets/bh.jpeg";
import i3 from "../assets/shekhar.jpg";

export default function Contributors() {
  const team = [
    {
      name: "Atulya Shekhar",
      linkedin: "https://www.linkedin.com/in/atulya-shekhar-78bb40262/",
      image: i3,
    },
    {
      name: "Ritvik Bhardwaj",
      linkedin: "https://www.linkedin.com/in/ritvik-bhardwaj-084581253/",
      image: i2,
    },
    {
      name: "Lakshay Neem",
      linkedin: "https://www.linkedin.com/in/lakshay-neem/",
      image: i1,
    },
  ];

  return (
    <section id="contact" className="container my-5 py-5">
      <h2 className="text-center mb-5 text-light fw-bold">
        Project Contributors
      </h2>
      <div className="row justify-content-center g-4">
        {team.map((member, index) => (
          <div key={index} className="col-sm-10 col-md-6 col-lg-4">
            <ContactCard
              name={member.name}
              linkedin={member.linkedin}
              image={member.image}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
