"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

interface Props {
  images: string[];
  title: string;
  href?: string;
  thumbnails?: boolean;
}

export function ProductImageCarousel({ images, title, href, thumbnails = false }: Props) {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const photos = [...new Set(images.filter(Boolean))];
  useEffect(() => {
    if (!api) return;
    const update = () => setSelected(api.selectedScrollSnap());
    const frame = requestAnimationFrame(update);
    api.on("select", update);
    api.on("reInit", update);
    return () => {
      cancelAnimationFrame(frame);
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);

  if (photos.length === 0) return <div className="aspect-16/10 flex items-center justify-center text-zinc-400 text-xs">Imagem indisponível</div>;
  return <div className="min-w-0 w-full">
    <Carousel opts={{ loop: photos.length > 1 }} setApi={setApi} aria-label={`Fotos de ${title}`}>
      <CarouselContent className="ml-0">
        {photos.map((photo, index) => {
          const image = <Image src={photo} alt={`${title} - Foto ${index + 1}`} fill draggable={false}
            sizes={thumbnails ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"}
            priority={thumbnails && index === 0} className={`object-contain ${thumbnails ? "p-4" : "p-2.5"}`} />;
          return <CarouselItem key={photo} className="pl-0" aria-label={`Foto ${index + 1} de ${photos.length}`}>
            {href ? <Link href={href} draggable={false} className="relative block aspect-16/10">{image}</Link> : <div className="relative aspect-16/10">{image}</div>}
          </CarouselItem>;
        })}
      </CarouselContent>
      {photos.length > 1 && <>
        <CarouselPrevious aria-label="Foto anterior" className="left-2 z-10 size-9 bg-white/90 shadow-sm hover:bg-orange-50 hover:text-orange-700" />
        <CarouselNext aria-label="Próxima foto" className="right-2 z-10 size-9 bg-white/90 shadow-sm hover:bg-orange-50 hover:text-orange-700" />
        <span aria-live="polite" aria-atomic="true" className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white tabular-nums">{selected + 1} / {photos.length}</span>
      </>}
    </Carousel>
    {thumbnails && photos.length > 1 && <div className="flex gap-2.5 overflow-x-auto py-3" aria-label="Miniaturas do produto">
      {photos.map((photo, index) => <Button type="button" key={photo} variant="ghost" aria-label={`Ver foto ${index + 1}`} aria-pressed={selected === index}
        onClick={() => api?.scrollTo(index)} className={`relative size-20 shrink-0 overflow-hidden rounded-xl border-2 p-0 ${selected === index ? "border-orange-500 bg-orange-50" : "border-zinc-200"}`}>
        <Image src={photo} alt="" fill sizes="80px" className="object-contain p-1" />
      </Button>)}
    </div>}
  </div>;
}
