"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_LANDING_DATA,
  DEFAULT_PLATFORMS,
  DEFAULT_RELEASES,
  DEFAULT_FEATURES,
  DEFAULT_FAQS,
  DEFAULT_TESTIMONIALS_LIST,
  DEFAULT_ROSTER,
  DEFAULT_CONTACT_DATA,
  normalizeImageUrl,
  type LandingPageData,
  type ReleaseItem,
  type FeatureItem,
  type FaqItem,
  type TestiItem,
  type RosterArtist,
  type ContactSectionData,
} from "@/lib/landingDefaults";
import { resolveDspPlatform } from "@/lib/dspPlatforms";

const STYLES = `
  :root {
    --bg: #fdeef3;
    --bg-2: #fbe3eb;
    --ink: #141114;
    --muted: #7a6870;
    --ghost: #d6c3ca;
    --accent: #ff7fab;
    --accent-ink: #ffffff;
    --gutter: clamp(16px, 2.4vw, 32px);
  }
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html, body {
    height: auto;
    min-height: 100%;
  }
  
  body {
    background: var(--bg);
    color: var(--ink);
    overflow-x: hidden;
    font-family: "Inter Tight", system-ui, -apple-system, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  /* NAV */
  .nav {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--gutter);
  }
  
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: var(--ink);
    font-weight: 500;
    font-size: 15px;
    letter-spacing: -0.01em;
  }
  
  .brand-mark {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    background: var(--accent);
    display: grid;
    place-items: center;
  }
  
  .brand-mark svg {
    width: 18px;
    height: 18px;
  }
  
  .links {
    display: flex;
    align-items: center;
    gap: clamp(14px, 2vw, 28px);
  }
  
  .links a {
    color: var(--muted);
    text-decoration: none;
    font-size: 14px;
    transition: color .2s;
  }
  
  .links a:hover {
    color: var(--ink);
  }
  
  .links .cta {
    background: var(--accent);
    color: var(--accent-ink);
    font-weight: 500;
    padding: 10px 18px;
    border-radius: 10px;
    display: inline-flex;
    gap: 6px;
    align-items: center;
    transition: transform .2s, background .2s;
  }
  
  .links .cta:hover {
    color: #fff;
    background: #ff6a9c;
    transform: translateY(-1px);
  }

  /* MOBILE MENU BUTTON & DRAWER */
  .mobile-menu-btn {
    display: none;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(20, 17, 20, 0.08);
    border-radius: 10px;
    cursor: pointer;
    color: var(--ink);
    padding: 8px;
    z-index: 25;
    transition: background 0.2s, transform 0.15s;
  }
  .mobile-menu-btn:active {
    transform: scale(0.95);
  }

  .mobile-drawer-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 99;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }
  .mobile-drawer-overlay.open {
    opacity: 1;
    pointer-events: auto;
  }

  .mobile-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(85vw, 320px);
    background: #fff5f8;
    z-index: 100;
    box-shadow: -8px 0 32px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    transform: translateX(100%);
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    padding: 24px;
  }
  .mobile-drawer.open {
    transform: translateX(0);
  }

  .drawer-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(20, 17, 20, 0.08);
  }

  .drawer-close {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    border: none;
    background: rgba(20, 17, 20, 0.05);
    color: var(--ink);
    font-size: 18px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;
  }
  .drawer-close:hover {
    background: rgba(20, 17, 20, 0.1);
  }

  .drawer-links {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 24px 0;
    flex: 1;
    overflow-y: auto;
  }

  .drawer-link {
    font-size: 15px;
    font-weight: 600;
    color: var(--ink);
    text-decoration: none;
    padding: 12px 14px;
    border-radius: 10px;
    transition: background 0.15s, color 0.15s;
    letter-spacing: 0.02em;
  }
  .drawer-link:hover, .drawer-link:active {
    background: rgba(255, 127, 171, 0.15);
    color: #ff528e;
  }

  .drawer-footer {
    padding-top: 16px;
    border-top: 1px solid rgba(20, 17, 20, 0.08);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .drawer-cta {
    background: var(--accent);
    color: #fff;
    font-weight: 600;
    font-size: 15px;
    padding: 14px 20px;
    border-radius: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    box-shadow: 0 4px 14px rgba(255, 127, 171, 0.4);
    transition: transform 0.2s, background 0.2s;
  }
  .drawer-cta:hover {
    background: #ff6a9c;
    transform: translateY(-1px);
  }

  /* HERO */
  .hero {
    position: relative;
    height: 100vh;
    height: 100svh;
    min-height: 560px;
    overflow: hidden;
    touch-action: pan-y;
    cursor: none;
    background: radial-gradient(60% 55% at 50% 45%, #fff6f9 0%, rgba(255,246,249,0) 70%), 
                linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 100%);
  }

  /* MARQUEES */
  .marquees {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-58%);
    z-index: 1;
    pointer-events: none;
    user-select: none;
    display: flex;
    flex-direction: column;
    gap: clamp(4px, 1.2vw, 18px);
  }
  
  .row {
    display: flex;
    width: max-content;
    white-space: nowrap;
    will-change: transform;
  }
  
  .row span {
    font-size: clamp(54px, 9.6vw, 168px);
    line-height: 1;
    letter-spacing: -0.035em;
    text-transform: uppercase;
    padding-right: 0.3em;
  }
  
  .row.ghost span {
    color: var(--ghost);
    font-weight: 400;
  }
  
  .row.solid span {
    color: var(--ink);
    font-weight: 500;
  }
  
  .row.ghost { animation: slideL 38s linear infinite; }
  .row.solid { animation: slideR 32s linear infinite; }
  
  @keyframes slideL { from { transform: translateX(0) } to { transform: translateX(-50%) } }
  @keyframes slideR { from { transform: translateX(-50%) } to { transform: translateX(0) } }

  /* FIGURE */
  .figure {
    position: absolute;
    left: 50%;
    bottom: 0;
    z-index: 2;
    height: min(94svh, 133vw);
    aspect-ratio: 3/4;
    transform: translateX(-50%);
    pointer-events: none;
  }
  
  .figure img, .figure canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center bottom;
    display: block;
  }
  
  .figure img {
    opacity: 0;
  }
  
  .figure canvas {
    opacity: 0;
    transition: opacity .8s ease;
  }
  
  .figure canvas.ready {
    opacity: 1;
  }

  /* CUSTOM CURSOR */
  .cursor {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 30;
    pointer-events: none;
    width: 14px;
    height: 14px;
    margin: -7px 0 0 -7px;
    border-radius: 50%;
    background: var(--accent);
    opacity: 0;
    transition: opacity .25s, width .2s, height .2s;
  }
  
  .hero:hover ~ .cursor, .cursor.on {
    opacity: 1;
  }

  /* HINT + TAG */
  .hint {
    position: absolute;
    left: var(--gutter);
    bottom: var(--gutter);
    z-index: 3;
    font-size: 13px;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .hint i {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
  }
  
  .tag {
    position: absolute;
    right: var(--gutter);
    bottom: var(--gutter);
    z-index: 3;
    font-size: 12px;
    color: var(--ink);
    background: rgba(255,255,255,.7);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    padding: 8px 12px;
    border-radius: 999px;
  }

  /* RESPONSIVE */
  @media (max-width: 720px) {
    .links { display: none !important; }
    .mobile-menu-btn { display: flex !important; }
    .brand { font-size: 14px; }
    .brand-mark { width: 30px; height: 30px; border-radius: 8px; }
    .hero { cursor: auto; }
    .marquees { transform: translateY(-62%); }
    .figure { height: auto; width: min(160vw, 64svh); }
    .tag { display: none; }
    .hint {
      left: 50%;
      transform: translateX(-50%);
      bottom: 18px;
      background: rgba(255,255,255,.75);
      padding: 8px 12px;
      border-radius: 999px;
      color: var(--ink);
      white-space: nowrap;
    }
  }
  @media (hover: none) { .cursor { display: none; } }
  @media (prefers-reduced-motion: reduce) { .row { animation-duration: 120s; } }

  /* --- SECTIONS STYLES --- */
  .content-section {
    padding: 100px var(--gutter);
    background: var(--bg);
    position: relative;
    z-index: 10;
  }
  
  .section-title {
    font-size: clamp(32px, 5vw, 48px);
    font-weight: 600;
    margin-bottom: 48px;
    letter-spacing: -0.03em;
    text-align: center;
    color: var(--ink);
  }
  
  /* 1. PLATFORMS WITH ORIGINAL LOGOS */
  .platforms-section {
    background: #0d0b0d;
    color: #fff;
    padding: 30px 0;
    overflow: hidden;
    position: relative;
    z-index: 10;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  .platform-track {
    display: flex;
    width: max-content;
    animation: scroll-left-fast 30s linear infinite;
  }
  .platform-track:hover {
    animation-play-state: paused;
  }
  .platform-track > div {
    display: flex;
    align-items: center;
  }
  .platform-item {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 8px 20px 8px 10px;
    margin: 0 10px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 999px;
    transition: background 0.25s, border-color 0.25s, transform 0.25s;
    white-space: nowrap;
    text-decoration: none;
    color: inherit;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
  .platform-item:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 127, 171, 0.5);
    transform: translateY(-2px);
  }
  .platform-logo-box {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 4px;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  .platform-logo-box img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    border-radius: 50%;
    display: block;
  }
  .platform-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .platform-name {
    font-size: 15px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: 0.02em;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .platform-badge {
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(255, 127, 171, 0.2);
    color: #ff7fab;
    letter-spacing: 0.06em;
  }
  @keyframes scroll-left-fast {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  
  /* 1.5 FEATURES (LAYANAN) */
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 24px;
    max-width: 1200px;
    margin: 0 auto;
  }
  .feature-card {
    background: #ffffff;
    padding: 40px 32px;
    border-radius: 24px;
    border: 1px solid rgba(20, 17, 20, 0.04);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(20, 17, 20, 0.04);
  }
  .feature-card h3 {
    font-size: 22px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 16px;
    letter-spacing: -0.01em;
  }
  .feature-card p {
    color: var(--muted);
    line-height: 1.6;
    font-size: 15px;
    margin-bottom: 24px;
  }
  .feature-card a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
    font-size: 15px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transition: color 0.2s;
  }
  .feature-card a:hover {
    color: #ff6a9c;
  }
  
  /* 2. FAQ */
  .faq-list {
    max-width: 760px;
    margin: 0 auto;
  }
  .faq-list details {
    border-bottom: 1px solid var(--ghost);
    padding: 24px 0;
    cursor: pointer;
  }
  .faq-list summary {
    font-size: 18px;
    font-weight: 500;
    list-style: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--ink);
  }
  .faq-list summary::-webkit-details-marker { display: none; }
  .faq-list summary::after {
    content: '+';
    font-size: 24px;
    font-weight: 400;
    transition: transform 0.3s ease;
    color: var(--accent);
  }
  .faq-list details[open] summary::after {
    transform: rotate(45deg);
  }
  .faq-content {
    padding-top: 16px;
    color: var(--muted);
    line-height: 1.6;
    font-size: 15px;
  }

  /* 3. TESTIMONI */
  .testi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .testi-card {
    background: var(--bg-2);
    padding: 32px;
    border-radius: 20px;
    transition: transform 0.2s;
  }
  .testi-card:hover {
    transform: translateY(-4px);
  }
  .testi-text {
    font-size: 16px;
    font-style: italic;
    margin-bottom: 24px;
    line-height: 1.6;
    color: #000000;
  }
  .testi-author {
    font-weight: 600;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #000000 !important;
  }
  .testi-author span {
    color: #000000 !important;
  }
  .testi-author img {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
  }

  /* 4. ARTIS */
  .artist-grid {
    display: flex;
    gap: 32px;
    overflow-x: auto;
    padding: 20px 0 40px 0;
    scroll-snap-type: x mandatory;
    max-width: 1100px;
    margin: 0 auto;
    scrollbar-width: none; 
  }
  .artist-grid::-webkit-scrollbar { display: none; }
  .artist-card {
    scroll-snap-align: start;
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  .artist-card img {
    width: 160px;
    height: 160px;
    border-radius: 50%;
    object-fit: cover;
    background: var(--ghost);
    border: 4px solid var(--bg-2);
    transition: border-color 0.2s;
  }
  .artist-card:hover img {
    border-color: var(--accent);
  }
  .artist-card span {
    font-weight: 600;
    font-size: 16px;
    color: var(--ink);
  }

  /* 5. KONTAK */
  .contact-section {
    background: var(--bg-2);
    text-align: center;
    padding: 100px var(--gutter);
  }
  .contact-box {
    max-width: 500px;
    margin: 0 auto;
  }
  .contact-box p {
    color: var(--muted);
    margin-bottom: 32px;
    line-height: 1.5;
  }
  .contact-form {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
  .contact-form input {
    padding: 16px 20px;
    border-radius: 12px;
    border: 1px solid var(--ghost);
    outline: none;
    width: 100%;
    font-family: inherit;
    background: #fff;
  }
  .contact-form button {
    padding: 16px 28px;
    border-radius: 12px;
    border: none;
    background: var(--ink);
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, transform 0.2s;
    font-family: inherit;
    white-space: nowrap;
  }
  .contact-form button:hover {
    background: var(--accent);
    transform: translateY(-2px);
  }
  
  .footer-bottom {
    text-align: center;
    padding: 32px var(--gutter);
    font-size: 14px;
    color: var(--muted);
    background: var(--bg-2);
    border-top: 1px solid rgba(20, 17, 20, 0.05);
  }

  @media (max-width: 600px) {
    .contact-form { flex-direction: column; }
    .contact-form button { width: 100%; }
  }

  /* --- NEW RELEASES DECK SECTION --- */
  .releases-section {
    background: var(--bg-2);
    overflow: hidden;
    padding: 100px var(--gutter) 140px var(--gutter);
    perspective: 1200px; 
  }
  
  .releases-deck {
    position: relative;
    height: 460px;
    max-width: 1000px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    transform-style: preserve-3d;
    will-change: transform;
  }
  
  .release-card {
    position: absolute;
    width: 300px;
    height: 420px;
    border-radius: 20px;
    background: var(--ghost);
    box-shadow: 0 15px 35px rgba(20, 17, 20, 0.15);
    transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), 
                opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow 0.6s cubic-bezier(0.22, 1, 0.36, 1);
    opacity: 0;
    transform: translateY(100px) scale(0.8) rotate(0deg); 
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.2);
  }
  
  .release-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  /* ANIMATED STATE */
  .releases-deck.in-view .card-l4 { transform: translateX(-340px) scale(0.65) rotate(-16deg); z-index: 1; opacity: 0; pointer-events: none; }
  .releases-deck.in-view .card-l3 { transform: translateX(-280px) scale(0.7) rotate(-12deg); z-index: 2; opacity: 1; }
  .releases-deck.in-view .card-l2 { transform: translateX(-200px) scale(0.8) rotate(-8deg); z-index: 3; opacity: 1; }
  .releases-deck.in-view .card-l1 { transform: translateX(-100px) scale(0.9) rotate(-4deg); z-index: 4; opacity: 1; }
  .releases-deck.in-view .card-center { transform: translateX(0) scale(1.05) rotate(0deg); z-index: 10; opacity: 1; box-shadow: 0 25px 50px rgba(20, 17, 20, 0.25); }
  .releases-deck.in-view .card-r1 { transform: translateX(100px) scale(0.9) rotate(4deg); z-index: 4; opacity: 1; }
  .releases-deck.in-view .card-r2 { transform: translateX(200px) scale(0.8) rotate(8deg); z-index: 3; opacity: 1; }
  .releases-deck.in-view .card-r3 { transform: translateX(280px) scale(0.7) rotate(12deg); z-index: 2; opacity: 1; }
  .releases-deck.in-view .card-r4 { transform: translateX(340px) scale(0.65) rotate(16deg); z-index: 1; opacity: 0; pointer-events: none; }

  /* CARD DETAILS OVERLAYS */
  .tag-live {
    position: absolute;
    top: 16px;
    left: 16px;
    background: #fff;
    color: var(--ink);
    padding: 6px 14px;
    border-radius: 99px;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s ease;
  }
  
  .tag-live i {
    width: 8px;
    height: 8px;
    background: #10b981; 
    border-radius: 50%;
  }
  
  .release-bottom {
    position: absolute;
    bottom: 16px;
    left: 16px;
    right: 16px;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 16px;
    border-radius: 16px;
    z-index: 10;
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.4s ease;
  }
  
  .releases-deck.in-view .card-center .tag-live,
  .releases-deck.in-view .card-center .release-bottom {
    opacity: 1;
    pointer-events: auto;
  }
  
  .release-meta h4 {
    font-size: 15px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .release-meta p {
    font-size: 13px;
    color: var(--muted);
    margin-bottom: 12px;
  }
  
  .btn-listen {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f1f1f1;
    color: var(--ink);
    text-decoration: none;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    transition: background 0.2s;
  }
  
  .btn-listen:hover {
    background: #e2e2e2;
  }

  .side-info {
    position: absolute;
    bottom: 16px;
    left: 12px;
    right: 12px;
    background: rgba(255,255,255,0.92);
    padding: 10px;
    border-radius: 12px;
    text-align: center;
    z-index: 10;
    opacity: 1;
    transition: opacity 0.4s ease;
  }
  
  .releases-deck.in-view .card-center .side-info {
    opacity: 0;
    pointer-events: none;
  }
  
  .side-info h4 {
    font-size: 12px;
    font-weight: 600;
    color: var(--ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 768px) {
    .releases-deck { height: 380px; }
    .release-card { width: 220px; height: 320px; }
    .releases-deck.in-view .card-l4 { transform: translateX(-160px) scale(0.65) rotate(-16deg); }
    .releases-deck.in-view .card-l3 { transform: translateX(-120px) scale(0.7) rotate(-12deg); }
    .releases-deck.in-view .card-l2 { transform: translateX(-80px) scale(0.8) rotate(-8deg); }
    .releases-deck.in-view .card-l1 { transform: translateX(-40px) scale(0.9) rotate(-4deg); }
    .releases-deck.in-view .card-center { transform: translateX(0) scale(1.05) rotate(0deg); }
    .releases-deck.in-view .card-r1 { transform: translateX(40px) scale(0.9) rotate(4deg); }
    .releases-deck.in-view .card-r2 { transform: translateX(80px) scale(0.8) rotate(8deg); }
    .releases-deck.in-view .card-r3 { transform: translateX(120px) scale(0.7) rotate(12deg); }
    .releases-deck.in-view .card-r4 { transform: translateX(160px) scale(0.65) rotate(16deg); }
    .release-bottom { padding: 12px; }
    .btn-listen { font-size: 12px; padding: 8px 12px; }
  }
`;

function PlatformLogoItem({ name }: { name: string }) {
  const info = resolveDspPlatform(name);
  const [imgErr, setImgErr] = useState(false);

  return (
    <div className="platform-item" title={`${info.name} • ${info.sub || "Partner Resmi BREAKOUT"}`}>
      <div className="platform-logo-box">
        {!imgErr ? (
          <img
            src={info.logoUrl}
            alt={info.name}
            onError={() => setImgErr(true)}
            loading="lazy"
          />
        ) : (
          <span style={{ fontSize: 12, fontWeight: 800, color: "#141114" }}>
            {info.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <div className="platform-info">
        <span className="platform-name">
          {info.name}
          {info.badge && <span className="platform-badge">{info.badge}</span>}
        </span>
      </div>
    </div>
  );
}

export default function BreakoutApp({
  initialData = DEFAULT_LANDING_DATA,
}: {
  initialData?: LandingPageData;
}) {
  const [data, setData] = useState<LandingPageData>(initialData);
  const [emailInput, setEmailInput] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const heroRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLImageElement>(null);
  const revealRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const hintTextRef = useRef<HTMLSpanElement>(null);

  const releasesSectionRef = useRef<HTMLDivElement>(null);
  const releasesDeckRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Real-time synchronization state with Web CMS
  useEffect(() => {
    fetch("/api/cms/landing")
      .then((res) => res.json())
      .then((json) => {
        if (json?.data) {
          setData(json.data);
        }
      })
      .catch((err) => console.warn("Failed to fetch live landing CMS:", err));
  }, []);

  // --- Hero Canvas Logic ---
  useEffect(() => {
    const hero = heroRef.current;
    const figure = figureRef.current;
    const front = frontRef.current;
    const reveal = revealRef.current;
    const cursor = cursorRef.current;
    const hintText = hintTextRef.current;

    if (!hero || !figure || !front || !reveal || !cursor || !hintText) return;

    const ctx = reveal.getContext("2d");
    if (!ctx) return;
    const mask = document.createElement("canvas");
    const mctx = mask.getContext("2d");
    const buf = document.createElement("canvas");
    const bctx = buf.getContext("2d");
    if (!mctx || !bctx) return;

    const touchMQ = window.matchMedia("(hover: none), (pointer: coarse)");
    let coarse = false;

    let W = 0,
      H = 0,
      dpr = 1;
    let frontReady = false;
    let backReady = false;

    let stamps: Array<{
      x: number;
      y: number;
      t: number;
      lobes: Array<{ angle: number; dist: number; r: number }>;
    }> = [];
    let last: { x: number; y: number } | null = null;
    let lastMove = 0;
    let autoT = 0;
    const LIFE = 1100;
    let reqId: number;

    const back = new window.Image();
    back.crossOrigin = "anonymous";
    back.onload = () => {
      backReady = true;
    };
    back.src =
      "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261103_152354_98c21034-6558-4210-a810-8232cf9d2557.png";

    function checkFront() {
      if (front && front.complete && front.naturalWidth) {
        frontReady = true;
        if (reveal) reveal.classList.add("ready");
      }
    }
    if (front.complete) checkFront();
    else front.addEventListener("load", checkFront);

    function syncTouch() {
      coarse = touchMQ.matches;
      if (hintText) {
        hintText.textContent = coarse ? "Drag to suit up" : "Move your cursor to suit up";
      }
    }
    syncTouch();
    touchMQ.addEventListener("change", syncTouch);

    function resize() {
      if (!figure || !reveal) return;
      const r = figure.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      const cw = Math.round(W * dpr);
      const ch = Math.round(H * dpr);

      reveal.width = cw;
      reveal.height = ch;
      mask.width = cw;
      mask.height = ch;
      buf.width = cw;
      buf.height = ch;
    }

    window.addEventListener("resize", resize);
    resize();

    function addStamp(x: number, y: number, now: number) {
      const base = Math.max(W, 260) * (coarse ? 0.15 : 0.12);
      const n = 3 + Math.floor(Math.random() * 3);
      const lobes = [];
      for (let i = 0; i < n; i++) {
        lobes.push({
          angle: Math.random() * Math.PI * 2,
          dist: Math.random() * base * 0.45,
          r: base * (0.45 + Math.random() * 0.55),
        });
      }
      stamps.push({ x, y, t: now, lobes });
    }

    function pointerTo(clientX: number, clientY: number, now: number) {
      if (!figure) return;
      const r = figure.getBoundingClientRect();
      const x = clientX - r.left;
      const y = clientY - r.top;

      if (last) {
        const dx = x - last.x;
        const dy = y - last.y;
        const dist = Math.hypot(dx, dy);
        const step = Math.max(W, 260) * 0.04;
        const count = Math.min(Math.floor(dist / step), 40);
        for (let i = 1; i <= count; i++) {
          addStamp(last.x + dx * (i / count), last.y + dy * (i / count), now);
        }
      }
      addStamp(x, y, now);
      last = { x, y };
      lastMove = now;
    }

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      pointerTo(e.clientX, e.clientY, now);
      if (cursor) {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        cursor.classList.add("on");
      }
    };

    const handlePointerLeave = () => {
      last = null;
      if (cursor) cursor.classList.remove("on");
    };

    const handlePointerDown = (e: PointerEvent) => {
      pointerTo(e.clientX, e.clientY, performance.now());
    };

    hero.addEventListener("pointermove", handlePointerMove);
    hero.addEventListener("pointerleave", handlePointerLeave);
    hero.addEventListener("pointerdown", handlePointerDown);

    function drawCover(c: CanvasRenderingContext2D, img: HTMLImageElement) {
      const cw = c.canvas.width;
      const ch = c.canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      if (!iw || !ih) return;
      const ratio = Math.max(cw / iw, ch / ih);
      const dw = iw * ratio;
      const dh = ih * ratio;
      const dx = (cw - dw) / 2;
      const dy = ch - dh;
      c.drawImage(img, dx, dy, dw, dh);
    }

    function render(now: number) {
      if (!ctx || !mctx || !bctx) return;
      if (coarse && now - lastMove > 2500) {
        autoT += 0.016;
        const ax = W * (0.5 + Math.sin(autoT * 1.3) * 0.28);
        const ay = H * (0.32 + Math.sin(autoT * 0.9 + 1) * 0.22);
        if (!last) last = { x: ax, y: ay };
        if (Math.hypot(ax - last.x, ay - last.y) > W * 0.02) {
          addStamp(ax, ay, now);
          last = { x: ax, y: ay };
        }
      }

      stamps = stamps.filter((s) => now - s.t < LIFE);

      mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mctx.clearRect(0, 0, W, H);

      if (stamps.length > 0) {
        mctx.fillStyle = "#000";
        stamps.forEach((s) => {
          const k = 1 - (now - s.t) / LIFE;
          let scale = k < 0.75 ? k / 0.75 : 1;
          if (scale < 0) scale = 0;
          s.lobes.forEach((lobe) => {
            const dx = Math.cos(lobe.angle) * lobe.dist;
            const dy = Math.sin(lobe.angle) * lobe.dist;
            mctx.beginPath();
            mctx.arc(
              s.x + dx * scale,
              s.y + dy * scale,
              lobe.r * Math.pow(scale, 0.8),
              0,
              Math.PI * 2
            );
            mctx.fill();
          });
        });
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      if (frontReady && front) {
        drawCover(ctx, front);
      }

      if (stamps.length > 0) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.drawImage(mask, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        if (backReady) {
          bctx.clearRect(0, 0, bctx.canvas.width, bctx.canvas.height);
          bctx.drawImage(mask, 0, 0);
          bctx.globalCompositeOperation = "source-in";
          drawCover(bctx, back);
          bctx.globalCompositeOperation = "source-over";
          ctx.drawImage(buf, 0, 0);
        }
      }
      reqId = requestAnimationFrame(render);
    }

    reqId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener("resize", resize);
      touchMQ.removeEventListener("change", syncTouch);
      hero.removeEventListener("pointermove", handlePointerMove);
      hero.removeEventListener("pointerleave", handlePointerLeave);
      hero.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  // --- Coverflow & Observer Logic for New Releases ---
  useEffect(() => {
    const releasesDeck = releasesDeckRef.current;
    const releasesSection = releasesSectionRef.current;

    if (releasesDeck) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      observer.observe(releasesDeck);
    }

    let activeIndex = 2; // Default Center

    function updateCoverflow(index: number) {
      if (index === activeIndex) return;
      activeIndex = index;
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        card.className = "release-card";
        const diff = i - activeIndex;
        if (diff === 0) card.classList.add("card-center");
        else if (diff === -1) card.classList.add("card-l1");
        else if (diff === -2) card.classList.add("card-l2");
        else if (diff === -3) card.classList.add("card-l3");
        else if (diff <= -4) card.classList.add("card-l4");
        else if (diff === 1) card.classList.add("card-r1");
        else if (diff === 2) card.classList.add("card-r2");
        else if (diff === 3) card.classList.add("card-r3");
        else if (diff >= 4) card.classList.add("card-r4");
      });
    }

    const handleMove = (clientX: number) => {
      if (!releasesDeck?.classList.contains("in-view") || !releasesSection) return;

      const rect = releasesSection.getBoundingClientRect();
      const x = clientX - rect.left;
      const count = cardsRef.current.length;
      if (count <= 1) return;
      let hoveredIndex = Math.round((x / rect.width) * (count - 1));

      if (hoveredIndex < 0) hoveredIndex = 0;
      if (hoveredIndex >= count) hoveredIndex = count - 1;

      updateCoverflow(hoveredIndex);
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
    const handleTouchStart = (e: TouchEvent) => handleMove(e.touches[0].clientX);

    const handleMouseLeave = () => {
      updateCoverflow(2);
    };

    if (releasesSection && releasesDeck) {
      releasesSection.addEventListener("mousemove", handleMouseMove);
      releasesSection.addEventListener("mouseleave", handleMouseLeave);
      releasesSection.addEventListener("touchmove", handleTouchMove, { passive: true });
      releasesSection.addEventListener("touchstart", handleTouchStart, { passive: true });
    }

    return () => {
      if (releasesSection) {
        releasesSection.removeEventListener("mousemove", handleMouseMove);
        releasesSection.removeEventListener("mouseleave", handleMouseLeave);
        releasesSection.removeEventListener("touchmove", handleTouchMove);
        releasesSection.removeEventListener("touchstart", handleTouchStart);
      }
    };
  }, [data?.releases?.length]);

  const platforms: string[] = data?.platforms || DEFAULT_PLATFORMS;
  const releases: ReleaseItem[] = data?.releases || DEFAULT_RELEASES;
  const features: FeatureItem[] = data?.features || DEFAULT_FEATURES;
  const faqs: FaqItem[] = data?.faqs || DEFAULT_FAQS;
  const testimonials: TestiItem[] = data?.testimonials || DEFAULT_TESTIMONIALS_LIST;
  const roster: RosterArtist[] = data?.roster || DEFAULT_ROSTER;
  const contact: ContactSectionData = data?.contact || DEFAULT_CONTACT_DATA;

  // Initial card class assigner
  const getInitialCardClass = (idx: number, centerIdx: number = 2) => {
    const diff = idx - centerIdx;
    if (diff === 0) return "card-center";
    if (diff === -1) return "card-l1";
    if (diff === -2) return "card-l2";
    if (diff === -3) return "card-l3";
    if (diff <= -4) return "card-l4";
    if (diff === 1) return "card-r1";
    if (diff === 2) return "card-r2";
    if (diff === 3) return "card-r3";
    return "card-r4";
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* HEADER NAV */}
      <header className="nav">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: "rotate(-12deg)" }}
            >
              <path d="M6 4h8a4 4 0 0 1 0 8H6z" />
              <path d="M6 12h9a4 4 0 0 1 0 8H6z" />
              <path d="M6 4v16" />
            </svg>
          </span>
          BREAKOUT
        </Link>
        <nav className="links">
          <a href="#rilisan">RELEASES</a>
          <a href="#layanan">LAYANAN</a>
          <a href="#faq">FAQ</a>
          <a href="#testimoni">TESTIMONI</a>
          <a href="#artis">ARTIS</a>
          <a href="#kontak">CONTACT</a>
          <Link className="cta" href="/login">
            LOGIN <span aria-hidden="true">↗</span>
          </Link>
        </nav>

        <button
          type="button"
          className="mobile-menu-btn"
          aria-label="Buka Menu"
          onClick={() => setMobileMenuOpen(true)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* MOBILE SLIDE BAR / DRAWER */}
      <div
        className={`mobile-drawer-overlay ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      />
      <div
        className={`mobile-drawer ${mobileMenuOpen ? "open" : ""}`}
        role="dialog"
        aria-label="Menu Mobile"
      >
        <div className="drawer-top">
          <div className="brand" style={{ pointerEvents: "none" }}>
            <span className="brand-mark">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transform: "rotate(-12deg)", width: 16, height: 16 }}
              >
                <path d="M6 4h8a4 4 0 0 1 0 8H6z" />
                <path d="M6 12h9a4 4 0 0 1 0 8H6z" />
                <path d="M6 4v16" />
              </svg>
            </span>
            BREAKOUT
          </div>
          <button
            type="button"
            className="drawer-close"
            aria-label="Tutup Menu"
            onClick={() => setMobileMenuOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="drawer-links">
          <a className="drawer-link" href="#rilisan" onClick={() => setMobileMenuOpen(false)}>
            RELEASES
          </a>
          <a className="drawer-link" href="#layanan" onClick={() => setMobileMenuOpen(false)}>
            LAYANAN
          </a>
          <a className="drawer-link" href="#faq" onClick={() => setMobileMenuOpen(false)}>
            FAQ
          </a>
          <a className="drawer-link" href="#testimoni" onClick={() => setMobileMenuOpen(false)}>
            TESTIMONI
          </a>
          <a className="drawer-link" href="#artis" onClick={() => setMobileMenuOpen(false)}>
            ARTIS
          </a>
          <a className="drawer-link" href="#kontak" onClick={() => setMobileMenuOpen(false)}>
            CONTACT
          </a>
        </nav>

        <div className="drawer-footer">
          <Link
            className="drawer-cta"
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
          >
            LOGIN <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>

      {/* BAR 1: HERO DENGAN PINK RIDER SUIT-UP CANVAS */}
      <section
        className="hero"
        id="hero"
        ref={heroRef}
        aria-label="Hover to reveal the pink rider"
      >
        <div className="marquees" aria-hidden="true">
          <div className="row ghost">
            <span>BREAKOUT.ID</span>
            <span>BREAKOUT.ID</span>
            <span>BREAKOUT.ID</span>
            <span>BREAKOUT.ID</span>
          </div>
          <div className="row solid">
            <span>MUSIC DISTRIBUTION FOR EVERYONE</span>
            <span>MUSIC DISTRIBUTION FOR EVERYONE</span>
            <span>MUSIC DISTRIBUTION FOR EVERYONE</span>
            <span>MUSIC DISTRIBUTION FOR EVERYONE</span>
          </div>
        </div>
        <div className="figure" id="figure" ref={figureRef}>
          <img
            id="front"
            ref={frontRef}
            alt="Young woman in a white ribbed top"
            crossOrigin="anonymous"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261103_152350_4fd91a2b-94c2-4b86-834f-3b7f9a716d5b.png"
          />
          <canvas id="reveal" ref={revealRef} aria-hidden="true" />
        </div>
        <p className="hint">
          <i />
          <span id="hintText" ref={hintTextRef}>
            Move your cursor to suit up
          </span>
        </p>
        <span className="tag">Pink Rider · SS27</span>
      </section>
      <div className="cursor" id="cursor" ref={cursorRef} />

      {/* BAR 2: PLATFORMS MARQUEE (SYNC DENGAN CMS DENGAN LOGO ASLI) */}
      <section className="platforms-section" id="platforms">
        <div className="platform-track">
          {/* First Set */}
          <div>
            {platforms.map((p, idx) => (
              <PlatformLogoItem key={`p1-${idx}`} name={p} />
            ))}
          </div>
          {/* Second Set (Duplicate for seamless continuous loop) */}
          <div>
            {platforms.map((p, idx) => (
              <PlatformLogoItem key={`p2-${idx}`} name={p} />
            ))}
          </div>
        </div>
      </section>

      {/* BAR 3: NEW RELEASES DECK (COVERFLOW 3D SYNC CMS) */}
      <section className="releases-section" id="rilisan" ref={releasesSectionRef}>
        <h2 className="section-title">NEW RELEASES</h2>
        <div className="releases-deck" id="releasesDeck" ref={releasesDeckRef}>
          {releases.map((rel, idx) => {
            const cardClass = getInitialCardClass(idx, Math.min(2, Math.floor(releases.length / 2)));
            return (
              <div
                key={rel.id || idx}
                className={`release-card ${cardClass}`}
                ref={(el) => {
                  cardsRef.current[idx] = el;
                }}
              >
                <div className="tag-live">
                  <i /> {rel.tag || "Live di DSP"}
                </div>
                <img
                  src={normalizeImageUrl(rel.coverUrl)}
                  alt={`${rel.title} Cover`}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://placehold.co/400x600/141114/ffffff?text=Music+Release";
                  }}
                />
                <div className="side-info">
                  <h4>{rel.artist}</h4>
                </div>
                <div className="release-bottom">
                  <div className="release-meta">
                    <h4>{rel.artist}</h4>
                    <p>{rel.title}</p>
                  </div>
                  <Link href={rel.listenUrl || "/login"} className="btn-listen">
                    ♪ Dengarkan di DSP <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* BAR 4: FITUR & LAYANAN (SYNC DENGAN CMS) */}
      <section className="content-section" id="layanan">
        <h2 className="section-title">Fitur & Layanan</h2>
        <div className="features-grid">
          {features.map((feat, idx) => (
            <div key={feat.id || idx} className="feature-card">
              <h3>{feat.title}</h3>
              <p>{feat.desc}</p>
              <Link href={feat.linkUrl || "/register"}>
                {feat.linkText || "Pelajari Selengkapnya"} <span aria-hidden="true">→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* BAR 5: FAQ ACCORDIONS (SYNC DENGAN CMS) */}
      <section className="content-section" id="faq">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, idx) => (
            <details key={faq.id || idx}>
              <summary>{faq.q}</summary>
              <div className="faq-content">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* BAR 6: TESTIMONI ARTIS (SYNC DENGAN CMS) */}
      <section
        className="content-section"
        id="testimoni"
        style={{ background: "var(--bg-2)" }}
      >
        <h2 className="section-title">Artist Testimonials</h2>
        <div className="testi-grid">
          {testimonials.map((testi, idx) => (
            <div key={testi.id || idx} className="testi-card">
              <p className="testi-text">"{testi.text}"</p>
              <div className="testi-author">
                <img
                  src={normalizeImageUrl(testi.avatar)}
                  alt={testi.author}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "https://placehold.co/100x100/ff7fab/ffffff?text=A";
                  }}
                />
                <span style={{ color: "#000000" }} className="text-black font-semibold">{testi.author}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BAR 7: ARTIS / FEATURED ROSTER (SYNC DENGAN CMS) */}
      <section className="content-section" id="artis">
        <h2 className="section-title">Featured Roster</h2>
        <div className="artist-grid">
          {roster.map((art, idx) => (
            <div key={art.id || idx} className="artist-card">
              <img
                src={normalizeImageUrl(art.imageUrl)}
                alt={art.name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "https://placehold.co/300x300/ff7fab/ffffff?text=Artist";
                }}
              />
              <span>{art.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* BAR 8: KONTAK / CALL TO ACTION (SYNC DENGAN CMS) */}
      <section className="contact-section" id="kontak">
        <div className="contact-box">
          <h2 className="section-title" style={{ marginBottom: "16px" }}>
            {contact.headline}
          </h2>
          <p>{contact.subtitle}</p>
          <form
            className="contact-form"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = `/register?email=${encodeURIComponent(emailInput)}`;
            }}
          >
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder={contact.placeholder || "Enter your email address"}
              required
            />
            <button type="submit">{contact.buttonText || "Get Started"}</button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-bottom">
        &copy; 2026 BREAKOUT.ID. All rights reserved. Music distribution for everyone.
      </footer>
    </>
  );
}
