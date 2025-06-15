import { Facebook, Twitter, Instagram, Linkedin, Youtube, Music, MapPin, MessageCircle } from "lucide-react";

interface SocialIconProps {
  platform: string;
  className?: string;
}

export function SocialIcon({ platform, className = "text-xl" }: SocialIconProps) {
  const iconMap: Record<string, JSX.Element> = {
    facebook: <Facebook className={className} />,
    twitter: <Twitter className={className} />,
    instagram: <Instagram className={className} />,
    linkedin: <Linkedin className={className} />,
    youtube: <Youtube className={className} />,
    tiktok: <Music className={className} />,
    pinterest: <MapPin className={className} />,
    discord: <MessageCircle className={className} />
  };

  return iconMap[platform.toLowerCase()] || <MessageCircle className={className} />;
}