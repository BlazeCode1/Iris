import React, { useState } from 'react';
import { Upload, Search, User, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Upload1 = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');
  const [activeTab, setActiveTab] = useState('new');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [patientID, setPatientID] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [patientConfirmed, setPatientConfirmed] = useState(false);
  const [existingPatientInfo, setExistingPatientInfo] = useState(null);
  const { toast } = useToast();

  const [patientData, setPatientData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    patientId: '',
    age: '',
    gender: '',
    medicalHistory: '',
  });

  const handlePatientDataChange = (e) => {
    const { name, value } = e.target;
    setPatientData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
    }
  };

  const handleConfirmPatient = async (e) => {
    e.preventDefault();

    if (activeTab === 'new') {
      const { firstName, lastName, patientId, age, dateOfBirth, gender, medicalHistory } = patientData;

      if (!firstName || !lastName || !patientId || !age || !dateOfBirth || !gender || !medicalHistory) {
        toast({
          title: "Missing info",
          description: "Please fill out all required fields.",
          variant: "destructive"
        });
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/newPatient", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: `${firstName} ${lastName}`,
            patientID: patientId,
            dateOfBirth,
            age,
            gender,
            medicalHistory
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create patient");

        setPatientID(patientId);
        
        setPatientConfirmed(true);
        toast({ title: "Patient created" });
      } catch (err) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive"
        });
      }
    }

    if (activeTab === 'existing') {
      if (!searchQuery) {
        toast({
          title: "Missing patient ID or name",
          description: "Please enter a search query.",
          variant: "destructive"
        });
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/searchPatient", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ searchPatient: searchQuery })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Patient not found");

        setPatientID(data.patient.patientID);
        setExistingPatientInfo(data.patient);
        setPatientConfirmed(true);
        toast({ title: "Patient found" });
      } catch (err) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive"
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile || !patientID) return;

    const formData = new FormData();
    formData.append("retinal-image", selectedFile);
    formData.append("patientID", patientID);

    setIsUploading(true);

    try {
      const res = await fetch("http://localhost:3000/upload", {
        method: "POST",
        credentials: "include",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      toast({ title: "Upload successful", description: "Image is being analyzed." });
      setPrediction({ result: data.prediction, confidence: data.confidence, heatmap: data.heatmap });
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3">Submit a Retinal Image</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Use the form below to create a new patient or search for an existing one,
              then upload a retinal scan. Ires will analyze the image and provide
              diagnostic insights to support your clinical decisions.
            </p>
          </div>

          <Card className="border-ires-purple/20 bg-card/95 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle>Upload Retinal Image</CardTitle>
              <CardDescription>
                Select a patient and upload their retinal scan for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="new" value={activeTab} onValueChange={value => {
                setActiveTab(value);
                setPatientConfirmed(false);
              }} className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="new">New Patient</TabsTrigger>
                  <TabsTrigger value="existing">Existing Patient</TabsTrigger>
                </TabsList>

                <TabsContent value="new">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium">First Name *</label>
                        <Input name="firstName" value={patientData.firstName} onChange={handlePatientDataChange} required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium">Last Name *</label>
                        <Input name="lastName" value={patientData.lastName} onChange={handlePatientDataChange} required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="patientId" className="text-sm font-medium">Patient ID *</label>
                        <Input name="patientId" value={patientData.patientId} onChange={handlePatientDataChange} required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth *</label>
                        <Input type="date" name="dateOfBirth" value={patientData.dateOfBirth} onChange={handlePatientDataChange} />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="age" className="text-sm font-medium">Age *</label>
                        <Input type="number" name="age" value={patientData.age} onChange={handlePatientDataChange} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Gender *</label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="radio" name="gender" value="Male" checked={patientData.gender === 'Male'} onChange={handlePatientDataChange} />
                            Male
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="radio" name="gender" value="Female" checked={patientData.gender === 'Female'} onChange={handlePatientDataChange} />
                            Female
                          </label>
                        </div>
                      </div>
                      <div className="col-span-full space-y-2">
                        <label htmlFor="medicalHistory" className="text-sm font-medium">Medical History *</label>
                        <textarea
                          name="medicalHistory"
                          value={patientData.medicalHistory}
                          onChange={handlePatientDataChange}
                          className="w-full rounded-md border px-3 py-2 text-sm bg-background border-input text-foreground"
                          required
                        />
                      </div>
                    </div>

                    {!patientConfirmed ? (
                      <Button onClick={handleConfirmPatient} type="button" className="w-full bg-gradient-ires hover:bg-gradient-ires/90">
                        Create Patient
                      </Button>
                    ) : (
                      <>

                        <div className="border rounded-md p-4 bg-muted/30 space-y-2 text-sm text-muted-foreground">
                          <div><strong>Patient Name:</strong> {patientData.firstName} {patientData.lastName}</div>
                          <div><strong>Patient ID:</strong> {patientData.patientId}</div>
                          <div><strong>Age:</strong> {patientData.age}</div>
                          <div><strong>Gender:</strong> {patientData.gender}</div>
                          <div><strong>Date of Birth:</strong> {patientData.dateOfBirth}</div>
                          <div><strong>Medical History:</strong> {patientData.medicalHistory}</div>
                        </div>


                        <UploadSection />

                        <Button type="submit" className="w-full bg-gradient-ires hover:bg-gradient-ires/90" disabled={isUploading}>
                          {isUploading ? 'Uploading...' : 'Upload and Analyze Image'}
                        </Button>
                      </>
                    )}
                  </form>
                </TabsContent>


                <TabsContent value="existing">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="search" className="text-sm font-medium">Search for Patient</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="search"
                          className="pl-10"
                          placeholder="Search by name or patient ID"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    {!patientConfirmed ? (
                      <Button onClick={handleConfirmPatient} type="button" className="w-full bg-gradient-ires hover:bg-gradient-ires/90">
                        Search Patient
                      </Button>
                    ) : (
                      <>

                        {patientConfirmed && existingPatientInfo && (
                          <div className="border rounded-md p-4 bg-muted/30 space-y-2 text-sm text-muted-foreground">
                            <div><strong>Patient ID:</strong> {existingPatientInfo.patientID}</div>
                            <div><strong>Name:</strong> {existingPatientInfo.name}</div>
                            <div><strong>Age:</strong> {existingPatientInfo.age}</div>
                            <div><strong>Gender:</strong> {existingPatientInfo.gender}</div>
                            <div><strong>Date of Birth:</strong> {existingPatientInfo.dateOfBirth || "N/A"}</div>
                            <div><strong>Medical History:</strong> {existingPatientInfo.medicalHistory}</div>
                          </div>
                        )}


                        <div className="pt-4">
                          <label className="block text-sm font-medium mb-2">Upload Retinal Image *</label>
                          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                            {filePreview ? (
                              <div className="space-y-4">
                                <img src={filePreview} alt="Retinal image preview" className="mx-auto max-h-64 rounded-md" />
                                <Button type="button" variant="outline" onClick={() => {
                                  setSelectedFile(null);
                                  setFilePreview('');
                                }}>
                                  Remove Image
                                </Button>
                              </div>
                            ) : (
                              <>
                                <FileImage className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground mb-4">Drag and drop your file here, or click to browse</p>
                                <Input
                                  type="file"
                                  id="retinalImageExisting"
                                  className="hidden"
                                  onChange={handleFileSelect}
                                  accept="image/*"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => document.getElementById('retinalImageExisting').click()}
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  Select File
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        <Button type="submit" className="w-full bg-gradient-ires hover:bg-gradient-ires/90" disabled={isUploading}>
                          {isUploading ? 'Uploading...' : 'Upload and Analyze Image'}
                        </Button>
                      </>
                    )}
                  </form>
                </TabsContent>

              </Tabs>
            </CardContent>

            {prediction && (
              <Card className="mt-10 border-ires-purple/20 bg-card/95 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle>Prediction Result</CardTitle>
                  <CardDescription>Analysis result and visual interpretation for the uploaded scan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Class: <span className="font-semibold text-foreground">{prediction.result}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Confidence: <span className="font-semibold text-foreground">{prediction.confidence}%</span>
                  </div>
                  {prediction.heatmap && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Prediction Visualization</p>
                      <img
                        src={`http://localhost:3000${prediction.heatmap}`}
                        alt="Prediction heatmap"
                        className="w-full max-h-96 object-contain rounded-md border"
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground pt-4">
                  This result is for clinical support only and not a standalone diagnosis.
                </CardFooter>
              </Card>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const UploadSection = ({ handleFileSelect, selectedFile, filePreview, setSelectedFile, setFilePreview }) => (
  <div className="pt-4">
    <label className="block text-sm font-medium mb-2">Upload Retinal Image *</label>
    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
      {filePreview ? (
        <div className="space-y-4">
          <img src={filePreview} alt="Retinal image preview" className="mx-auto max-h-64 rounded-md" />
          <Button type="button" variant="outline" onClick={() => {
            setSelectedFile(null);
            setFilePreview('');
          }}>
            Remove Image
          </Button>
        </div>
      ) : (
        <>
          <FileImage className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-4">Drag and drop your file here, or click to browse</p>
          <Input type="file" id="retinalImage" className="hidden" onChange={handleFileSelect} accept="image/*" />
          <Button type="button" variant="outline" onClick={() => document.getElementById('retinalImage').click()}>
            <Upload className="mr-2 h-4 w-4" /> Select File
          </Button>
        </>
      )}
    </div>
  </div>
);

export default Upload1;
