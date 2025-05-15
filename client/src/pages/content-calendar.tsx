import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import ContentCalendar from '@/components/ContentCalendar';

export default function ContentCalendarPage() {
  return (
    <>
      <Helmet>
        <title>Content Calendar | GlowBot</title>
        <meta name="description" content="Plan and schedule your content across multiple platforms with GlowBot's integrated content calendar." />
      </Helmet>
      <Navbar />
      <main>
        <ContentCalendar />
      </main>
    </>
  );
}