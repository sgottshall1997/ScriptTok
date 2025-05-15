import React, { useState, useCallback, useEffect, CSSProperties } from 'react';
import { Calendar, Views, EventPropGetter } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMinutes } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { NICHES, TONE_OPTIONS } from '@shared/constants';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  niche: string;
  platform: string;
  content: string;
  tone: string;
  color?: string;
}

const PLATFORMS = [
  'Instagram',
  'Facebook',
  'Twitter',
  'LinkedIn',
  'TikTok',
  'Pinterest',
  'Blog',
  'Email',
  'YouTube',
];

// Create a date-fns localizer for the calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Platform-specific colors for events
const platformColors: Record<string, string> = {
  Instagram: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
  Facebook: 'bg-blue-600 text-white',
  Twitter: 'bg-blue-400 text-white',
  LinkedIn: 'bg-blue-800 text-white',
  TikTok: 'bg-black text-white',
  Pinterest: 'bg-red-600 text-white',
  Blog: 'bg-green-600 text-white',
  Email: 'bg-yellow-500 text-white',
  YouTube: 'bg-red-700 text-white',
};

export default function ContentCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isNewEvent, setIsNewEvent] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventStart, setEventStart] = useState<Date>(new Date());
  const [eventEnd, setEventEnd] = useState<Date>(
    addMinutes(new Date(), 60)
  );
  const [eventNiche, setEventNiche] = useState('skincare');
  const [eventPlatform, setEventPlatform] = useState('Instagram');
  const [eventContent, setEventContent] = useState('');
  const [eventTone, setEventTone] = useState('friendly');

  // Load events from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('contentCalendarEvents');
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
      setEvents(parsedEvents);
    }
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('contentCalendarEvents', JSON.stringify(events));
    }
  }, [events]);

  // Handler for when a time slot is selected
  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      setSelectedSlot({ start, end });
      setEventStart(start);
      setEventEnd(end);
      setEventTitle('');
      setEventContent('');
      setIsNewEvent(true);
      setOpenDialog(true);
    },
    []
  );

  // Handler for when an event is selected
  const handleSelectEvent = useCallback(
    (event: CalendarEvent) => {
      setSelectedEvent(event);
      setEventTitle(event.title);
      setEventStart(event.start);
      setEventEnd(event.end);
      setEventNiche(event.niche);
      setEventPlatform(event.platform);
      setEventContent(event.content);
      setEventTone(event.tone);
      setIsNewEvent(false);
      setOpenDialog(true);
    },
    []
  );

  // Save event
  const handleSaveEvent = () => {
    const newEvent: CalendarEvent = {
      id: isNewEvent ? Math.random().toString(36).substring(2, 9) : (selectedEvent?.id || ''),
      title: eventTitle,
      start: eventStart,
      end: eventEnd,
      niche: eventNiche,
      platform: eventPlatform,
      content: eventContent,
      tone: eventTone,
    };

    if (isNewEvent) {
      setEvents([...events, newEvent]);
      toast({
        title: 'Event Created',
        description: `Content for ${eventPlatform} has been scheduled.`,
      });
    } else {
      setEvents(events.map(event => (event.id === newEvent.id ? newEvent : event)));
      toast({
        title: 'Event Updated',
        description: `Scheduled content has been updated.`,
      });
    }

    handleCloseDialog();
  };

  // Delete event
  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      toast({
        title: 'Event Deleted',
        description: 'Scheduled content has been removed.',
      });
      handleCloseDialog();
    }
  };

  // Generate content for the event
  const handleGenerateContent = async () => {
    if (!eventNiche || !eventPlatform || !eventTone) {
      toast({
        title: 'Missing Information',
        description: 'Please select a niche, platform, and tone before generating content.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create a prompt based on the event details
      const prompt = `Create a ${eventPlatform} post for the ${eventNiche} niche with a ${eventTone} tone. The post should be scheduled for ${format(eventStart, 'MMMM dd, yyyy')} and should be optimized for engagement and visibility on ${eventPlatform}.`;
      
      // Use Claude API or OpenAI API based on user preference
      const response = await apiRequest(
        'POST',
        '/api/claude-content',
        {
          prompt,
          niche: eventNiche,
          tone: eventTone,
          temperature: 0.7,
          maxTokens: 1024,
          includeProducts: true,
        }
      );

      const data = await response.json();
      setGeneratedContent(data.content);
      setEventContent(data.content);
      setEventTitle(`${eventPlatform} Post - ${format(eventStart, 'MMM dd')}`);
      
      toast({
        title: 'Content Generated',
        description: `Content has been generated for your ${eventPlatform} post.`,
      });
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Close the dialog and reset form
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
    setSelectedSlot(null);
    setEventTitle('');
    setEventContent('');
    setGeneratedContent('');
  };

  // Event style getter for the calendar
  const eventStyleGetter: EventPropGetter<CalendarEvent> = (event) => {
    return {
      className: platformColors[event.platform] || 'bg-gray-500 text-white',
      style: {} as CSSProperties
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Content Calendar</h1>
      <p className="text-gray-600 mb-6">
        Plan and schedule your content across multiple platforms. Click on a time slot to add new content or click on an existing event to edit.
      </p>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          defaultView={Views.MONTH}
          eventPropGetter={eventStyleGetter}
          onNavigate={(date) => setCurrentDate(date)}
        />
      </div>
      
      {/* Event Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isNewEvent ? 'Schedule New Content' : 'Edit Scheduled Content'}</DialogTitle>
            <DialogDescription>
              {isNewEvent
                ? 'Fill in the details to schedule new content.'
                : 'Edit your scheduled content details.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Content title"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date/Time</Label>
                  <Input
                    id="start-date"
                    type="datetime-local"
                    value={format(eventStart, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setEventStart(new Date(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date/Time</Label>
                  <Input
                    id="end-date"
                    type="datetime-local"
                    value={format(eventEnd, "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => setEventEnd(new Date(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="niche">Niche</Label>
                  <Select value={eventNiche} onValueChange={setEventNiche}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select niche" />
                    </SelectTrigger>
                    <SelectContent>
                      {NICHES.map((niche) => (
                        <SelectItem key={niche} value={niche}>
                          {niche.charAt(0).toUpperCase() + niche.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={eventPlatform} onValueChange={setEventPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="tone">Tone</Label>
                <Select value={eventTone} onValueChange={setEventTone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TONE_OPTIONS.map((tone) => (
                      <SelectItem key={tone} value={tone}>
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full" 
                variant="secondary" 
                onClick={handleGenerateContent}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Content'}
              </Button>
            </div>
            
            {/* Content Area */}
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={eventContent}
                onChange={(e) => setEventContent(e.target.value)}
                placeholder="Enter your content here or generate it"
                className="min-h-[250px]"
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <div>
              {!isNewEvent && (
                <Button variant="destructive" onClick={handleDeleteEvent}>
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleSaveEvent}>{isNewEvent ? 'Schedule' : 'Update'}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Legend */}
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Platforms</h3>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((platform) => (
            <div
              key={platform}
              className={`px-3 py-1 rounded-full text-sm ${platformColors[platform]}`}
            >
              {platform}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}