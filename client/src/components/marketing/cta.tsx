"use client";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Container from "../global/container";
import { Button } from "../ui/button";
import Particles from "../ui/particles";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "lucide-react";
import React from "react";
import BlurText from "@/components/blur-text";

const CTA = () => {
    return (
        <div className="relative flex flex-col items-center justify-center w-full py-20">
            <Container className="py-20 max-w-6xl mx-auto">
                <div className="relative flex flex-col items-center justify-center py-12 lg:py-20 px-0 rounded-2xl lg:rounded-3xl bg-background/20 text-center border border-foreground/20 overflow-hidden">
                    <Particles
                        refresh
                        ease={80}
                        quantity={80}
                        color="#d4d4d4"
                        className="hidden lg:block absolute inset-0 z-0"
                    />
                    <Particles
                        refresh
                        ease={80}
                        quantity={35}
                        color="#d4d4d4"
                        className="block lg:hidden absolute inset-0 z-0"
                    />

                    <div
                        style={{
                            background: 'conic-gradient(from 0deg at 50% 50%, #a855f7 0deg, #3b82f6 180deg, #06b6d4 360deg)',
                            position: 'absolute',
                            bottom: '-12.5%',
                            left: '33.333%',
                            transform: 'translateX(-50%)',
                            width: '11rem',
                            height: '8rem',
                            borderRadius: '9999px',
                            filter: 'blur(5rem)',
                            zIndex: -10,
                        }}
                        className="lg:h-52 lg:w-1/3 lg:blur-[10rem]"
                    />
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-medium !leading-snug">
                        <BlurText 
                            text="Ready to boost your" 
                            delay={100}
                        />
                        <br /> 
                        <span className="font-subheading italic">
                            <BlurText 
                                text="social presence" 
                                delay={150}
                            />
                        </span> ?
                    </h2>
                    <p className="text-sm md:text-lg text-center text-accent-foreground/80 max-w-2xl mx-auto mt-4">
                        Elevate your online presence with stunning customization. Create, share, and stand out effortlessly <span className="hidden lg:inline">and make smarter decisions in minutes.</span>
                    </p>
                    <Link to="#pricing" className="mt-8">
                        <Button size="lg">
                            Let&apos;s get started
                        </Button>
                    </Link>
                </div>
            </Container>
        </div>
    )
};

export default CTA
