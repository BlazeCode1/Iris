
import React from 'react';
import { Button } from '@/components/ui/button';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              <span className="text-gradient">Transforming</span> Diabetic Retinopathy Care
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Advanced AI diagnostics for medical professionals, delivering precise results in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Button asChild size="lg" className="bg-gradient-ires hover:bg-gradient-ires/90 border-none text-white">
                <Link to="/upload">Upload Retinal Image <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-ires-purple hover:bg-ires-purple/10">
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-ires-blue/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Why <span className="text-gradient">Ires</span> for Your Practice
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-6 shadow-lg hover:shadow-ires-purple/20 transition-all">
              <div className="h-12 w-12 rounded-full bg-gradient-ires flex items-center justify-center mb-4">
                <span className="text-white text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Lightning Fast Analysis</h3>
              <p className="text-muted-foreground">
                Get accurate retinal diagnostics in seconds, not days, allowing for immediate clinical decisions.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-lg hover:shadow-ires-purple/20 transition-all">
              <div className="h-12 w-12 rounded-full bg-gradient-ires flex items-center justify-center mb-4">
                <span className="text-white text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Clinical Accuracy</h3>
              <p className="text-muted-foreground">
                Our AI model is trained on vast datasets, providing diagnostic accuracy that rivals specialist ophthalmologists.
              </p>
            </div>
            
            <div className="bg-card rounded-lg p-6 shadow-lg hover:shadow-ires-purple/20 transition-all">
              <div className="h-12 w-12 rounded-full bg-gradient-ires flex items-center justify-center mb-4">
                <span className="text-white text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Seamless Workflow</h3>
              <p className="text-muted-foreground">
                Effortlessly integrate into your existing clinical workflow with our intuitive interface and comprehensive dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Retinal Diagnostics?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join the growing network of healthcare providers leveraging AI for better patient outcomes.
            </p>
            <Button asChild size="lg" className="bg-gradient-ires hover:bg-gradient-ires/90 border-none text-white">
              <Link to="/upload">Start Using Ires Today <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
      
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default Index;
