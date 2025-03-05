"use client";

import Image from "next/image";
import { useTheme } from "../providers/ThemeProvider";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { theme } = useTheme();
  const router = useRouter();
  const [cardImages, setCardImages] = useState<string[]>([]);
  const containerRef1 = useRef<HTMLDivElement>(null);
  const containerRef2 = useRef<HTMLDivElement>(null);
  
  // 홈 페이지 사전 로딩
  useEffect(() => {
    router.prefetch('/home');
  }, [router]);
  
  // 두 슬라이드에 대한 참조와 위치 상태 정의
  const scrollRef1 = useRef<HTMLDivElement>(null);
  const scrollRef2 = useRef<HTMLDivElement>(null);
  const [scrollPosition1, setScrollPosition1] = useState(0);
  const [scrollPosition2, setScrollPosition2] = useState(0);
  
  // 카드 크기 및 간격, 속도에 대한 공통 상수
  const CARD_WIDTH = 150;
  const CARD_GAP = 25;
  const CARD_SPEED = 2;
  
  // 화면에 보이는 카드 수 계산 (동적으로 계산)
  const calculateVisibleCards = (containerWidth: number) => {
    return Math.ceil(containerWidth / (CARD_WIDTH + CARD_GAP)) + 2; // 여유분 추가
  };
  
  // 카드 이미지 경로 생성 및 랜덤 정렬
  useEffect(() => {
    const suits = ['clover', 'diamond', 'heart', 'spade'];
    const ranks = ['a', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'j', 'q', 'k'];
    const version = ['1', '2'];
    
    const allCards: string[] = [];
    suits.forEach(suit => {
      ranks.forEach(rank => {
        version.forEach(v => {
          allCards.push(`/cards/webp/${suit}_${rank}_${v}.webp`);
        });
      });
    });
    
    const shuffledCards = [...allCards].sort(() => Math.random() - 0.5);
    setCardImages(shuffledCards);
  }, []);
  
  // 슬라이드 애니메이션을 위한 단일 useEffect
  useEffect(() => {
    if (!cardImages.length) return;
    
    // 전체 카드 배열의 너비
    const totalCardsWidth = cardImages.length * (CARD_WIDTH + CARD_GAP);
    const animationIds: number[] = [];
    
    // 첫 번째 슬라이드 애니메이션
    if (scrollRef1.current) {
      const animate1 = () => {
        setScrollPosition1(prev => {
          const newPosition = (prev + CARD_SPEED) % totalCardsWidth;
          return newPosition;
        });
        
        animationIds.push(requestAnimationFrame(animate1));
      };
      
      animationIds.push(requestAnimationFrame(animate1));
    }
    
    // 두 번째 슬라이드 애니메이션
    if (scrollRef2.current) {
      const animate2 = () => {
        setScrollPosition2(prev => {
          const newPosition = (prev + CARD_SPEED) % totalCardsWidth;
          return newPosition;
        });
        
        animationIds.push(requestAnimationFrame(animate2));
      };
      
      animationIds.push(requestAnimationFrame(animate2));
    }
    
    // 클린업 함수
    return () => {
      animationIds.forEach(id => cancelAnimationFrame(id));
    };
  }, [cardImages]);
  
  // 더블 버퍼링을 위한 중복 카드 배열 생성
  const duplicatedCards = useMemo(() => {
    if (!cardImages.length) return [];
    // 원래 카드를 2번 반복하여 무한 슬라이드 효과
    return [...cardImages, ...cardImages];
  }, [cardImages]);
  
  // 카드 컴포넌트를 렌더링하는 함수
  const renderCard = (src: string, index: number, slideIndex: number, isReverse: boolean) => (
    <div 
      key={`slide${slideIndex}-${src}-${index}`} 
      className="w-[150px] h-[210px] flex-shrink-0 relative rounded-md overflow-hidden shadow-lg"
      style={isReverse ? { direction: 'ltr' } : undefined}
    >
      <Image
        src={src}
        alt={`카드 이미지 ${index + 1}`}
        fill
        sizes="(max-width: 768px) 150px, 150px"
        className="object-contain"
      />
    </div>
  );

  const logoSrc = theme === 'dark' 
    ? '/icons/logo_text_gausian.webp' 
    : '/icons/logo_text.webp';

  const handleLogin = () => {
    // 버튼 클릭 즉시 페이지 이동 전에 시각적 피드백 제공 
    // (버튼 비활성화나 로딩 상태를 표시할 수 있음)
    const button = document.activeElement;
    if (button instanceof HTMLButtonElement) {
      button.style.opacity = '0.7';
    }
    
    // 작은 timeout으로 UI 변화를 볼 수 있는 시간 제공 후 페이지 이동
    setTimeout(() => {
      router.push('/home');
    }, 10);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4 p-4 w-full max-w-5xl mx-auto relative">
      <div className="absolute w-[200%] h-64 top-2/8 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[30deg] origin-center">
        {/* 첫 번째 카드 슬라이드 */}
        <div 
          ref={containerRef1}
          className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full overflow-hidden"
        >
          <div 
            ref={scrollRef1}
            className="flex items-center space-x-6 py-4"
            style={{ 
              transform: `translateX(-${scrollPosition1}px)`,
              width: 'max-content'
            }}
          >
            {duplicatedCards.map((src, index) => renderCard(src, index, 1, false))}
          </div>
        </div>
      </div>
      <div className="absolute w-[200%] h-64 top-6/8 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-[30deg] origin-center">
        {/* 두 번째 카드 슬라이드 */}
        <div 
          ref={containerRef2}
          className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full overflow-hidden"
        >
          <div 
            ref={scrollRef2}
            className="flex items-center space-x-6 py-4"
            style={{ 
              transform: `translateX(-${scrollPosition2}px)`,
              width: 'max-content',
              direction: 'rtl'
            }}
          >
            {duplicatedCards.map((src, index) => renderCard(src, index, 2, true))}
          </div>
        </div>
      </div>
      
      <div className="w-full md:w-3/4 lg:w-2/3 h-32 sm:h-36 md:h-40 lg:h-44 relative z-10">
        <Image
          src={logoSrc}
          alt="Cardomoku Logo"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 66vw"
          priority
          className="object-contain"
        />
      </div>
      
      <div className="w-full sm:w-2/3 md:w-1/2 lg:w-2/5 h-12 sm:h-14 relative z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-300 dark:to-gray-700 opacity-70 rounded-lg blur-sm -z-10"></div>
        <button onClick={handleLogin} className="w-full h-full relative">
          <Image
            src="/images/kakao_login_button.png"
            alt="Kakao Login"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 66vw, (max-width: 1024px) 50vw, 40vw"
            className="object-contain cursor-pointer"
          />
        </button>
      </div>
    </div>
  );
}
