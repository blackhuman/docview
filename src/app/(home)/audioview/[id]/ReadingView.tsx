'use client'

import { Manifest } from './type'
import { useMemo, useRef, useState, useCallback } from 'react'
import { PlayCircleIcon } from '@heroicons/react/24/solid'

interface Props {
  manifest: Manifest
}

class Content {
  url: string
  paragraphs: {
    sentences: {
      text: string
      start: number
      end: number
    }[]
    start: number
    end: number
  }[]

  constructor(manifest: Manifest) {
    const { url, data } = manifest
    this.url = url
    const paragraphs = data.results.channels
      .flatMap(channel => channel.alternatives)
      .flatMap(alternative => alternative.paragraphs?.paragraphs ?? [])
    this.paragraphs = paragraphs.map(paragraph => {
      return {
        sentences: paragraph.sentences.map(sentence => ({
          text: sentence.text,
          start: sentence.start,
          end: sentence.end
        })),
        start: paragraph.start,
        end: paragraph.end
      }
    })
  }
}

export function ReadingView({ manifest }: Props) {
  const content = useMemo(() => new Content(manifest), [manifest])
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }, [])

  const isCurrentSentence = useCallback((start: number, end: number) => {
    return currentTime >= start && currentTime <= end
  }, [currentTime])

  const jumpToTime = useCallback((time: number) => {
    console.log('jumping to', time)
    if (audioRef.current) {
      console.log('audioRef.current seekable', audioRef.current.seekable.start(0), audioRef.current.seekable.end(0))
      audioRef.current.currentTime = time
      if (audioRef.current.paused) {
        audioRef.current.play()
      }
    }
  }, [audioRef])

  return (
    <div className='m-5 pl-8'>
      {content.paragraphs.map(paragraph => (
        <p key={paragraph.start} className='pt-2'>
          {paragraph.sentences.map(sentence => (
            <span key={sentence.start}>
              <span
                onClick={() => jumpToTime(sentence.start)}
                className="absolute -left-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title="Play from here"
              >
                <PlayCircleIcon className="h-5 w-5 text-blue-500 hover:text-blue-600" />
              </span>
              <span 
                className={`group relative items-center ${isCurrentSentence(sentence.start, sentence.end) ? 'bg-yellow-200' : ''} transition-colors duration-200`}
              >
                {sentence.text + ' '}
              </span>
            </span>
          ))}
        </p>
      ))}
      <div className="mt-4 sticky bottom-2">
        <audio 
          ref={audioRef}
          controls 
          src={content.url}
          onTimeUpdate={handleTimeUpdate}
        ></audio>
      </div>
    </div>
  )
}