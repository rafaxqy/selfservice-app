import { motion } from "framer-motion";
import { ChevronRight, Clock, MapPin, UtensilsCrossed } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-sushi.jpg";
import logoImage from "@/assets/logo-japa-sushi.png";
import { Footer } from "@/components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative h-screen overflow-hidden">
        <img
          src={heroImage}
          alt="Japa Sushi"
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center"
          style={{ objectPosition: '50% 40%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-6 h-44 w-44 md:h-56 md:w-56 rounded-full overflow-hidden bg-white shadow-[0_8px_40px_rgba(0,0,0,0.6)] flex items-center justify-center p-3"
          >
            <img src={logoImage} alt="Japa Sushi Logo" className="h-full w-full object-contain" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold text-foreground"
          >
            Japa Sushi
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-3 text-lg md:text-xl text-muted-foreground font-light tracking-wide max-w-md"
          >
            寿司 — Sabores autênticos da culinária japonesa
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-10"
          >
            <Link
              to="/cardapio"
              className="group inline-flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-xl transition-all hover:scale-105 hover:shadow-primary/30 hover:shadow-2xl"
            >
              <UtensilsCrossed className="h-5 w-5" />
              Ver Cardápio
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="h-8 w-5 rounded-full border-2 border-foreground/30 flex items-start justify-center p-1">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-foreground/50"
            />
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border bg-card p-6 text-center">
            <Clock className="mx-auto h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-foreground">Horário</h3>
            <p className="mt-1 text-sm text-muted-foreground">Terça a Domingo</p>
            <p className="text-sm text-muted-foreground">19:00 — 23:30</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-border bg-card p-6 text-center">
            <MapPin className="mx-auto h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-foreground">Localização</h3>
            <p className="mt-1 text-sm text-muted-foreground">Av. Antônio Carlos, R. São Geraldo, 51A</p>
            <p className="text-sm text-muted-foreground">Salinas — MG</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border border-border bg-card p-6 text-center">
            <UtensilsCrossed className="mx-auto h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-foreground">Auto Atendimento</h3>
            <p className="mt-1 text-sm text-muted-foreground">Peça direto da sua mesa</p>
            <p className="text-sm text-muted-foreground">Escaneie o QR Code</p>
          </motion.div>
        </div>

        <div className="mt-12 text-center">
          <Link to="/cardapio" className="inline-flex items-center gap-2 text-primary font-medium hover:underline text-lg">
            Explorar o Cardápio
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
