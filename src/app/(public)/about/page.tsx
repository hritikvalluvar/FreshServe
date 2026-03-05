import Image from "next/image";
import Button from "@/components/ui/Button";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-6">About Us</h1>
      <div className="bg-[var(--brand-card)] shadow rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-center mb-3">Our Story</h2>
        <p className="text-[var(--brand-muted)] leading-relaxed">
          Welcome to our little corner of the culinary world. What started as a personal passion for cooking has blossomed into a business that brings joy to many. For years, friends, family, and even strangers have showered us with praise for the food we prepare, and this encouragement was the driving force behind the creation of this small business.
        </p>
        <p className="text-[var(--brand-muted)] leading-relaxed">
          Everything we offer is prepared with love and care. I take great pride in sourcing only the finest, most natural ingredients to create authentic, flavorful dishes. Every masala is handcrafted with my own recipe, ensuring a unique, homemade taste in every bite. These masalas are so close to my heart that I&apos;ve decided to make them available for sale, so you can enjoy the flavors of our kitchen at home, too.
        </p>
        <p className="text-[var(--brand-muted)] leading-relaxed">
          While I manage the kitchen and ensure every dish is prepared with the utmost care, my husband supports me in every other aspect of the business. From bookkeeping and resource management to packaging orders, he&apos;s always there by my side, even though he has his own busy day job. Every morning, he helps me pack the orders before heading off to work. Together, we&apos;ve built something special, fueled by hard work and a shared passion for food.
        </p>
        <p className="text-[var(--brand-muted)] leading-relaxed">
          Running a small business has its challenges, especially when it comes to taking orders through WhatsApp, manually sorting messages, and following up on payments. This website is our step towards simplifying these tasks, making it easier for our customers to place orders, track payments, and connect with us—all in one place. We&apos;re here to make your experience with us as seamless and enjoyable as possible.
        </p>
        <div className="text-center mt-6">
          <Image
            src="https://i.ibb.co/RzYSjCf/PXL-20231209-105046251.jpg"
            alt="Tanuja Soundharraj Valluvar"
            width={300}
            height={300}
            className="rounded-full mx-auto object-cover"
            style={{ width: 300, height: 300 }}
          />
          <p className="mt-3 font-semibold">Tanuja Soundharraj Valluvar</p>
        </div>
        <div className="text-center mt-6">
          <Button href="/order" className="text-lg">Order Now</Button>
        </div>
      </div>
    </div>
  );
}
