'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/ui/file-upload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2 } from 'lucide-react';
import { db } from '@/lib/db';

// Schema
const vinylSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist: z.string().min(1, 'Artist is required'),
});

type TrackInput = {
    title: string;
    side: 'A' | 'B';
    file: File | null;
}

export const VinylUploader = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [coverFront, setCoverFront] = useState<File | null>(null);
  const [coverBack, setCoverBack] = useState<File | null>(null);
  
  // Track State
  const [tracks, setTracks] = useState<TrackInput[]>([]);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(vinylSchema),
  });

  const addTrack = () => {
    setTracks([...tracks, { title: '', side: 'A', file: null }]);
  };

  const removeTrack = (index: number) => {
    setTracks(tracks.filter((_, i) => i !== index));
  };

  const updateTrack = (index: number, field: keyof TrackInput, value: any) => {
    const newTracks = [...tracks];
    // @ts-ignore
    newTracks[index][field] = value;
    setTracks(newTracks);
  };

  const onSubmit = async (data: any) => {
    if (!coverFront || !coverBack) {
      alert("Please upload both covers");
      return;
    }

    try {
      // Save Vinyl
      const vinylId = await db.vinyls.add({
        title: data.title,
        artist: data.artist,
        coverFront: coverFront,
        coverBack: coverBack,
        createdAt: new Date(),
      });

      // Save Tracks
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if (track.file && track.title) {
            await db.tracks.add({
                vinylId: vinylId as number,
                title: track.title,
                side: track.side,
                order: i,
                audio: track.file
            });
        }
      }

      reset();
      setCoverFront(null);
      setCoverBack(null);
      setTracks([]);
      setOpen(false);
    } catch (error) {
      console.error("Failed to save vinyl", error);
      alert("Failed to save vinyl");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-sans tracking-tight text-primary">Add New Vinyl</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="info" className="data-[state=active]:bg-background data-[state=active]:text-primary font-bold">Album Info</TabsTrigger>
              <TabsTrigger value="tracks" className="data-[state=active]:bg-background data-[state=active]:text-primary font-bold">Tracks</TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 p-1 mt-4">
                <TabsContent value="info" className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Album Title</Label>
                            <Input {...register('title')} placeholder="e.g. Dark Side of the Moon" className="bg-white/50" />
                            {errors.title && <p className="text-red-500 text-sm">Required</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Artist</Label>
                            <Input {...register('artist')} placeholder="e.g. Pink Floyd" className="bg-white/50" />
                            {errors.artist && <p className="text-red-500 text-sm">Required</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Front Cover</Label>
                            <FileUpload 
                                accept={{'image/*': []}} 
                                label="Front Cover" 
                                onFileSelect={setCoverFront}
                                value={coverFront}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Back Cover</Label>
                            <FileUpload 
                                accept={{'image/*': []}} 
                                label="Back Cover" 
                                onFileSelect={setCoverBack}
                                value={coverBack}
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="tracks" className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <Label className="text-lg font-bold">Tracklist</Label>
                        <Button type="button" size="sm" onClick={addTrack} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                            <Plus className="w-4 h-4 mr-2" /> Add Track
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {tracks.map((track, index) => (
                            <div key={index} className="flex gap-3 items-start p-3 rounded-lg bg-white/40 border border-border/50">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 mt-1">
                                    {index + 1}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex gap-2">
                                        <Input 
                                            placeholder="Track Title" 
                                            value={track.title} 
                                            onChange={(e) => updateTrack(index, 'title', e.target.value)}
                                            className="flex-1 bg-white/70"
                                        />
                                        <select 
                                            className="h-10 rounded-md border border-input bg-white/70 px-3 py-1 text-sm shadow-sm"
                                            value={track.side}
                                            onChange={(e) => updateTrack(index, 'side', e.target.value)}
                                        >
                                            <option value="A">Side A</option>
                                            <option value="B">Side B</option>
                                        </select>
                                    </div>
                                    <div className="w-full">
                                         <FileUpload 
                                            accept={{'audio/*': ['.mp3', '.wav']}} 
                                            label="Audio File" 
                                            onFileSelect={(f) => updateTrack(index, 'file', f)}
                                            value={track.file}
                                            className="h-[80px] min-h-[80px] p-2 text-xs"
                                        />
                                    </div>
                                </div>
                                <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => removeTrack(index)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                        {tracks.length === 0 && (
                            <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-muted rounded-xl">
                                No tracks added yet.
                            </div>
                        )}
                    </div>
                </TabsContent>
            </ScrollArea>

            <div className="pt-4 flex justify-end gap-2 border-t border-border mt-2">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary text-white hover:bg-primary/90 font-bold px-8">
                    Save Album
                </Button>
            </div>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  );
};
