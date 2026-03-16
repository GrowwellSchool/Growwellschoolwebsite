'use client'

import { CircularGallery } from "./circular-gallery";
import type { GalleryItem } from "./circular-gallery";

const galleryData: GalleryItem[] = [
  {
    common: "Sports & Athletics",
    binomial: "Physical Education",
    photo: {
      url: "/images/activity1.jpg",
      text: "Students participating in sports activities",
      pos: "50% 50%",
      by: "Growwell School",
    },
  },
  {
    common: "Cultural Events",
    binomial: "Celebrating Traditions",
    photo: {
      url: "/images/activity2.jpg",
      text: "Students performing on stage",
      pos: "50% 50%",
      by: "Growwell School",
    },
  },
  {
    common: "Learning Environments",
    binomial: "Interactive Classrooms",
    photo: {
      url: "/images/activity3.jpg",
      text: "Students in a classroom setting",
      pos: "50% 50%",
      by: "Growwell School",
    },
  },
  {
    common: "Creative Arts",
    binomial: "Expression & Design",
    photo: {
      url: "/images/activity4.jpg",
      text: "Art and craft activities",
      pos: "50% 50%",
      by: "Growwell School",
    },
  },
  {
    common: "Annual Function",
    binomial: "Performances & Awards",
    photo: {
      url: "/images/activity5.jpg",
      text: "Annual day celebration",
      pos: "50% 50%",
      by: "Growwell School",
    },
  },
  {
    common: "Play Ground",
    binomial: "Outdoor Fun",
    photo: {
      url: "/images/activity6.jpg",
      text: "Kids playing in the ground",
      pos: "50% 50%",
      by: "Growwell School",
    },
  },
  {
    common: "Library Time",
    binomial: "Reading & Discovery",
    photo: {
      url: "/images/activity7.jpg",
      text: "Students reading books",
      pos: "50% 50%",
      by: "Growwell School",
    },
  },
  {
    common: "Lab Experiments",
    binomial: "Science & Innovation",
    photo: {
      url: "/images/activity8.jpg",
      text: "Science laboratory",
      pos: "50% 50%",
      by: "Growwell School",
    },
  },
  {
    common: "Music & Dance",
    binomial: "Rhythm & Harmony",
    photo: {
      url: "/images/activity9.jpg",
      text: "Music and dance room",
      pos: "50% 50%",
      by: "Growwell School",
    },
  },
  {
    common: "Educational Trips",
    binomial: "Nature & Exploration",
    photo: {
      url: "/images/activity10.jpg",
      text: "Outdoor educational trip",
      pos: "50% 50%",
      by: "Growwell School",
    },
  },
];

const CircularGalleryDemo = () => {
  return (
    <section className="w-full bg-school-dark text-white relative py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 text-center relative z-10 mb-10">
        <span className="inline-block bg-school-gold/20 text-school-gold text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded mb-4">
          Gallery
        </span>
			  <h2 className="text-3xl lg:text-4xl font-heading font-black text-white">Memories at Growwell</h2>
			<br />
        <p className="text-gray-400 mt-2"></p>
      </div>

      <div className="w-full h-[500px] flex items-center justify-center">
        <CircularGallery items={galleryData} radius={600} />
      </div>
    </section>
  );
};

export default CircularGalleryDemo;
