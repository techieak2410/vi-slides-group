import PptxGenJS from 'pptxgenjs';
import type { Question } from './questionService';

interface ExportSessionInfo {
    title: string;
    code: string;
}

const cleanText = (value?: string): string => {
    if (!value) return '';

    return value
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
};

const getAnswerDetails = (question: Question): { label: string; value: string } => {
    if (question.teacherAnswer?.trim()) {
        return {
            label: 'Teacher Answer',
            value: cleanText(question.teacherAnswer)
        };
    }

    if (question.aiAnalysis?.aiAnswer?.trim()) {
        return {
            label: 'Suggested Answer',
            value: cleanText(question.aiAnalysis.aiAnswer)
        };
    }

    return {
        label: 'Answer',
        value: 'No answer has been added for this question yet.'
    };
};

const getQuestionMeta = (question: Question): string => {
    const author = question.user?.name || question.guestName || 'Anonymous';
    const askedAt = new Date(question.createdAt).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
    const voteCount = question.upvotes?.length || 0;
    const voteText = voteCount > 0 ? ` • ${voteCount} upvote${voteCount === 1 ? '' : 's'}` : '';

    return `Asked by ${author}${voteText} • ${askedAt}`;
};

export const exportQuestionsToPPT = async (session: ExportSessionInfo, questions: Question[]) => {
    const pptx = new PptxGenJS();

    pptx.layout = 'LAYOUT_WIDE';
    pptx.author = 'VI Slides';
    pptx.company = 'VI Slides';
    pptx.subject = `${session.title} questions and answers export`;
    pptx.title = `${session.title} - Questions and Answers`;

    const orderedQuestions = [...questions].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    if (!orderedQuestions.length) {
        const emptySlide = pptx.addSlide();
        emptySlide.background = { color: 'F8FAFC' };
        emptySlide.addShape(pptx.ShapeType.rect, {
            x: 0,
            y: 0,
            w: 13.333,
            h: 0.6,
            fill: { color: '1D4ED8' },
            line: { color: '1D4ED8' }
        });
        emptySlide.addText(session.title || 'Session Export', {
            x: 0.45,
            y: 0.12,
            w: 9,
            h: 0.28,
            fontSize: 22,
            bold: true,
            color: 'FFFFFF'
        });
        emptySlide.addText('No questions are available to export yet.', {
            x: 0.8,
            y: 2.5,
            w: 11.7,
            h: 0.7,
            fontSize: 26,
            bold: true,
            align: 'center',
            color: '0F172A'
        });
        emptySlide.addText(`Session code: ${session.code}`, {
            x: 0.8,
            y: 3.35,
            w: 11.7,
            h: 0.4,
            fontSize: 16,
            align: 'center',
            color: '475569'
        });

        await pptx.writeFile({ fileName: `Session-${session.code}-Questions-Answers.pptx` });
        return;
    }

    orderedQuestions.forEach((question, index) => {
        const slide = pptx.addSlide();
        const questionText = cleanText(question.refinedContent || question.content) || 'Untitled question';
        const answerDetails = getAnswerDetails(question);

        slide.background = { color: 'F8FAFC' };
        slide.addShape(pptx.ShapeType.rect, {
            x: 0,
            y: 0,
            w: 13.333,
            h: 0.6,
            fill: { color: '1D4ED8' },
            line: { color: '1D4ED8' }
        });

        slide.addText(session.title || 'Session Export', {
            x: 0.45,
            y: 0.12,
            w: 9.4,
            h: 0.28,
            fontSize: 22,
            bold: true,
            color: 'FFFFFF'
        });
        slide.addText(`Question ${index + 1}`, {
            x: 10.6,
            y: 0.12,
            w: 2.2,
            h: 0.28,
            fontSize: 14,
            bold: true,
            align: 'right',
            color: 'DBEAFE'
        });

        slide.addText('Question', {
            x: 0.55,
            y: 0.85,
            w: 2.3,
            h: 0.24,
            fontSize: 14,
            bold: true,
            color: '1D4ED8'
        });
        slide.addShape(pptx.ShapeType.rect, {
            x: 0.5,
            y: 1.15,
            w: 12.3,
            h: 2.25,
            fill: { color: 'FFFFFF' },
            line: { color: 'BFDBFE', pt: 1.25 }
        });
        slide.addText(questionText, {
            x: 0.8,
            y: 1.42,
            w: 11.7,
            h: 1.75,
            fontSize: 22,
            bold: true,
            color: '0F172A',
            margin: 0.08,
            fit: 'shrink'
        });

        slide.addText(answerDetails.label, {
            x: 0.55,
            y: 3.75,
            w: 2.5,
            h: 0.24,
            fontSize: 14,
            bold: true,
            color: '0F766E'
        });
        slide.addShape(pptx.ShapeType.rect, {
            x: 0.5,
            y: 4.05,
            w: 12.3,
            h: 2.1,
            fill: { color: 'F0FDFA' },
            line: { color: '99F6E4', pt: 1.25 }
        });
        slide.addText(answerDetails.value, {
            x: 0.8,
            y: 4.28,
            w: 11.7,
            h: 1.65,
            fontSize: 18,
            color: '134E4A',
            margin: 0.08,
            fit: 'shrink'
        });

        slide.addText(getQuestionMeta(question), {
            x: 0.55,
            y: 6.55,
            w: 8,
            h: 0.25,
            fontSize: 10,
            color: '64748B'
        });
        slide.addText(`Session code: ${session.code}`, {
            x: 9.4,
            y: 6.55,
            w: 3.35,
            h: 0.25,
            fontSize: 10,
            align: 'right',
            color: '64748B'
        });
    });

    await pptx.writeFile({ fileName: `Session-${session.code}-Questions-Answers.pptx` });
};
