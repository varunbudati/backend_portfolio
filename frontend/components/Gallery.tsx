"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaSyncAlt, FaThLarge } from "react-icons/fa";

const catPhotos = [
    "/images/cat-images/web/IMG_5870.jpg",
    "/images/cat-images/web/IMG_5913.jpg",
    "/images/cat-images/web/IMG_5918.jpg",
    "/images/cat-images/web/IMG_6076.jpg",
    "/images/cat-images/web/IMG_6150.jpg",
    "/images/cat-images/web/IMG_6179.jpg",
    "/images/cat-images/web/IMG_6228.jpg",
    "/images/cat-images/web/IMG_6300.jpg",
    "/images/cat-images/web/IMG_6305.jpg",
    "/images/cat-images/web/IMG_6378.jpg",
    "/images/cat-images/web/IMG_6409.jpg",
    "/images/cat-images/web/IMG_6514.jpg",
    "/images/cat-images/web/IMG_6650.jpg",
    "/images/cat-images/web/IMG_6673.jpg",
    "/images/cat-images/web/IMG_6730.jpg",
    "/images/cat-images/web/IMG_6747.jpg",
    "/images/cat-images/web/IMG_6784.jpg",
    "/images/cat-images/web/IMG_6786.jpg",
    "/images/cat-images/web/IMG_6821.jpg",
    "/images/cat-images/web/IMG_6852.jpg",
    "/images/cat-images/web/IMG_6883.jpg",
    "/images/cat-images/web/IMG_6890.jpg",
    "/images/cat-images/web/IMG_6897.jpg",
    "/images/cat-images/web/IMG_6976.jpg",
    "/images/cat-images/web/IMG_7046.jpg",
];

const eventPhotos = [
    "/images/events/DSC_0593-845x684.jpeg",
    "/images/events/DSC_0667.jpeg",
    "/images/events/DSC_0799.jpeg",
    "/images/events/DSC_0901.jpeg",
    "/images/events/IMG_3724.JPG",
    "/images/events/IMG_7613.jpg",
    "/images/events/Media-1500x430.jpeg",
    "/images/events/1743677374010.jpg",
];

export default function Gallery({ fadeUp }: { fadeUp?: any }) {
    const [galleryMode, setGalleryMode] = useState<"collage" | "rotate">("collage");
    const [rotateIndex, setRotateIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [showAllCats, setShowAllCats] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    const galleryImages = [...catPhotos, ...eventPhotos];

    useEffect(() => {
        if (galleryMode !== "rotate") return;

        const interval = setInterval(() => {
            setRotateIndex((prev) => (prev + 1) % galleryImages.length);
        }, 2500);

        return () => clearInterval(interval);
    }, [galleryMode, galleryImages.length]);

    useEffect(() => {
        if (!lightboxOpen) return;

        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") closeLightbox();
            if (event.key === "ArrowRight") stepLightbox(1);
            if (event.key === "ArrowLeft") stepLightbox(-1);
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [lightboxOpen, galleryImages.length]);

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => setLightboxOpen(false);

    const stepLightbox = (delta: number) => {
        setLightboxIndex((prev) => (prev + delta + galleryImages.length) % galleryImages.length);
    };

    return (
        <>
            <motion.section id="gallery" className="section" {...fadeUp}>
                <div className="section__header">
                    <h2 className="section__title">Gallery</h2>
                    <span className="section__hint">Cats and event highlights</span>
                </div>
                <div className="gallery-toggle">
                    <button
                        className={`btn secondary icon-btn ${galleryMode === "collage" ? "active" : ""}`}
                        type="button"
                        onClick={() => setGalleryMode("collage")}
                        aria-label="Collage view"
                        title="Collage view"
                    >
                        <FaThLarge aria-hidden />
                    </button>
                    <button
                        className={`btn secondary icon-btn ${galleryMode === "rotate" ? "active" : ""}`}
                        type="button"
                        onClick={() => setGalleryMode("rotate")}
                        aria-label="Rotating view"
                        title="Rotating view"
                    >
                        <FaSyncAlt aria-hidden />
                    </button>
                </div>
                {galleryMode === "collage" ? (
                    <div className="card-grid">
                        <div className="card">
                            <div className="section__header" style={{ marginBottom: 12 }}>
                                <h3 className="section__title">Cats</h3>
                                <span className="section__hint">{catPhotos.length} photos</span>
                            </div>
                            <div className="media-grid">
                                {(showAllCats ? catPhotos : catPhotos.slice(0, 8)).map((src, idx) => {
                                    const actualIdx = showAllCats ? idx : catPhotos.indexOf(src);
                                    return (
                                        <motion.div
                                            key={src}
                                            className="media-thumb"
                                            whileHover={{ scale: 1.02, boxShadow: "0 12px 32px rgba(0,0,0,0.25)" }}
                                            onClick={() => openLightbox(actualIdx)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") openLightbox(actualIdx);
                                            }}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <Image src={src} alt="Cat" width={480} height={320} />
                                        </motion.div>
                                    );
                                })}
                            </div>
                            {catPhotos.length > 8 && (
                                <button
                                    className="btn secondary"
                                    onClick={() => setShowAllCats(!showAllCats)}
                                    style={{ marginTop: 16, width: "100%" }}
                                >
                                    {showAllCats ? "Show Less" : `Show All ${catPhotos.length} Photos`}
                                </button>
                            )}
                        </div>

                        <div className="card">
                            <div className="section__header" style={{ marginBottom: 12 }}>
                                <h3 className="section__title">Events</h3>
                                <span className="section__hint">{eventPhotos.length} photos</span>
                            </div>
                            <div className="media-grid">
                                {eventPhotos.map((src, idx) => (
                                    <motion.div
                                        key={src}
                                        className="media-thumb"
                                        whileHover={{ scale: 1.02, boxShadow: "0 12px 32px rgba(0,0,0,0.25)" }}
                                        onClick={() => openLightbox(catPhotos.length + idx)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") openLightbox(catPhotos.length + idx);
                                        }}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <Image src={src} alt="Event" width={480} height={320} />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="card" style={{ display: "grid", gap: 16 }}>
                        <div className="section__header" style={{ marginBottom: 0 }}>
                            <h3 className="section__title">Rotating Highlights</h3>
                            <span className="section__hint">Auto-rotates every ~2.5s</span>
                        </div>
                        <div className="media-rotate">
                            <div
                                className="media-rotate__frame"
                                role="button"
                                tabIndex={0}
                                onClick={() => openLightbox(rotateIndex)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") openLightbox(rotateIndex);
                                }}
                            >
                                <Image
                                    src={galleryImages[rotateIndex]}
                                    alt="Gallery highlight"
                                    width={960}
                                    height={540}
                                    priority
                                />
                            </div>
                            <div className="media-rotate__dots" role="tablist" aria-label="Gallery slides">
                                {galleryImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        className={`dot ${idx === rotateIndex ? "active" : ""}`}
                                        onClick={() => setRotateIndex(idx)}
                                        aria-pressed={idx === rotateIndex}
                                        aria-label={`Go to slide ${idx + 1}`}
                                        type="button"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </motion.section>

            {lightboxOpen && (
                <div
                    className="lightbox"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Expanded gallery image"
                    onClick={closeLightbox}
                >
                    <div className="lightbox__inner" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox__close" type="button" onClick={closeLightbox} aria-label="Close">
                            ×
                        </button>
                        <button
                            className="lightbox__nav prev"
                            type="button"
                            onClick={() => stepLightbox(-1)}
                            aria-label="Previous image"
                        >
                            ‹
                        </button>
                        <div className="lightbox__media">
                            <Image
                                src={galleryImages[lightboxIndex]}
                                alt="Expanded gallery"
                                fill
                                sizes="90vw"
                                style={{ objectFit: "contain" }}
                                priority
                            />
                        </div>
                        <button
                            className="lightbox__nav next"
                            type="button"
                            onClick={() => stepLightbox(1)}
                            aria-label="Next image"
                        >
                            ›
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
