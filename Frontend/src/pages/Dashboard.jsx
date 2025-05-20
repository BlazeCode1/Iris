import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { Search, User, Calendar, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';


const DiagnosisBadge = ({ level }) => {
  if (!level) return null;
  if (level === 'Healthy') return <Badge className="bg-green-600">{level}</Badge>;
  if (level === 'Early DR') return <Badge className="bg-yellow-500">{level}</Badge>;
  if (level === 'Advanced DR') return <Badge className="bg-red-600">{level}</Badge>;
  return <Badge variant="outline">{level}</Badge>;
};

const Dashboard = () => {
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('card');

  const { data: diagnostics = [], isLoading, error } = useQuery({
    queryKey: ["diagnostics"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3000/api/diagnostics", {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch diagnostics");
      return res.json();
    }
  });

  const filteredPatients = diagnostics.filter((patient) => {
    const query = searchQuery.toLowerCase();
    return (
      patient.patientName?.toLowerCase().includes(query) ||
      patient.patientID?.toLowerCase().includes(query)
    );
  });

  if (isLoading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Error loading diagnostics</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <Tabs defaultValue={activeView} value={activeView} onValueChange={setActiveView}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-3">Patient Dashboard</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Review and manage patient diagnostics in one place. Click on any patient card to
                view detailed diagnostic results, confidence scores, image data, and history of
                screenings conducted with Ires.
              </p>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients by name or ID"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="card">Card</TabsTrigger>
                  <TabsTrigger value="table">Table</TabsTrigger>
                </TabsList>
                <Button variant="outline" size="sm" onClick={() => window.location.href = '/upload'}>
                  Add Patient
                </Button>
              </div>
            </div>

            {filteredPatients.length === 0 ? (
              <Card className="w-full p-8 text-center">
                <CardContent>
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No patients found</p>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or add a new patient to get started.
                  </p>
                  <Button
                    onClick={() => window.location.href = '/upload'}
                    className="bg-gradient-ires hover:bg-gradient-ires/90"
                  >
                    Add New Patient
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <TabsContent value="card">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPatients.map(patient => (
                      <Card
                        key={patient.diagnosisID}
                        className="hover:border-ires-purple/60 transition-all cursor-pointer"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{patient.patientName}</CardTitle>
                              <CardDescription>ID: {patient.patientID}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>Diagnosed: {new Date(patient.dateDiagnosed).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center mt-4">
                              <div>
                                <p className="text-sm font-medium">Diagnosis:</p>
                                <DiagnosisBadge level={patient.result} />
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">Confidence:</p>
                                <span className="text-sm">{patient.confidenceScore}%</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t pt-3 flex justify-end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-ires-brightPurple hover:text-ires-brightPurple/90 hover:bg-ires-brightPurple/10"
                                onClick={() => setSelectedDiagnosis(patient)}
                              >
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl">
                              <DialogHeader>
                                <DialogTitle>Diagnostic Details</DialogTitle>
                                <DialogDescription>
                                  Patient ID: {patient.patientID}
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                                  <p>{patient.patientName}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Diagnosis</p>
                                  <DiagnosisBadge level={patient.result} />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Confidence</p>
                                  {((patient.confidenceScore) * 100).toFixed(2)}%
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                                  <p>{new Date(patient.dateDiagnosed).toLocaleDateString()}</p>
                                </div>
                                {patient.imagePath && (
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-2">Prediction Visualization</p>
                                    <img
                                      src={`http://localhost:3000${patient.imagePath}`}
                                      alt="Heatmap Result"
                                      className="w-full max-h-72 object-contain rounded-md border"
                                    />
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="table">
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Patient ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Diagnosed</TableHead>
                            <TableHead>Diagnosis</TableHead>
                            <TableHead>Confidence</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPatients.map(patient => (
                            <TableRow key={patient.diagnosisID}>
                              <TableCell>{patient.patientID}</TableCell>
                              <TableCell>{patient.patientName}</TableCell>
                              <TableCell>{new Date(patient.dateDiagnosed).toLocaleDateString()}</TableCell>
                              <TableCell><DiagnosisBadge level={patient.result} /></TableCell>
                              <TableCell>{(patient.confidenceScore * 100).toFixed(2)}%</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-ires-brightPurple hover:text-ires-brightPurple/90 hover:bg-ires-brightPurple/10"
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
