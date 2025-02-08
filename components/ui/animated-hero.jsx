import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

function Hero() {
  const router = useRouter();
  const [titleNumber, setTitleNumber] = useState(0);
  
  const titles = useMemo(() => [
    "Delicious Recipes",
    "Cook Like a Pro",
    "Tasty Dishes",
    "Explore Cuisines",
    "Master Cooking"
  ], []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Button 
              variant="secondary" 
              size="sm" 
              className="gap-4 bg-pink-100 hover:bg-pink-200 text-pink-700"
              onClick={() => router.push('/food')}
            >
              Explore our recipes <MoveRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-pink-600">Delicious recipes</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold text-purple-600"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-pink-700/80 max-w-2xl text-center">
              Discover a world of flavors right from your kitchen. Our curated collection 
              of recipes makes cooking an adventure. From quick weekday meals to gourmet 
              weekend feasts, we've got something delicious for everyone.
            </p>
          </div>
          
          <div className="flex flex-row gap-3">
            <Button 
              size="lg" 
              className="gap-4 border-pink-200 hover:bg-pink-50 text-pink-700" 
              variant="outline"
              onClick={() => router.push('/food')}
            >
              Browse Recipes <UtensilsCrossed className="w-4 h-4" />
            </Button>
            <Button 
              size="lg" 
              className="gap-4 bg-pink-500 hover:bg-pink-600 text-white"
              onClick={() => router.push('/food')}
            >
              Start Cooking <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };