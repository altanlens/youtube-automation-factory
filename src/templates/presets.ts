import { TemplateEngine } from './TemplateEngine';
import { ExcalidrawShapes } from '../excalidraw/ExcalidrawRenderer';

// Math Lesson Template
TemplateEngine.registerTemplate({
  id: 'math-lesson',
  name: 'Matematik Dersi: {{topic}}',
  description: '{{topic}} konusunda interaktif matematik dersi',
  category: 'educational',
  parameters: [
    {
      key: 'topic',
      label: 'Konu Başlığı',
      type: 'text',
      required: true,
      placeholder: 'Pisagor Teoremi'
    },
    {
      key: 'formula',
      label: 'Formül',
      type: 'text',
      required: true,
      placeholder: 'a² + b² = c²'
    },
    {
      key: 'primaryColor',
      label: 'Ana Renk',
      type: 'color',
      required: false,
      defaultValue: '#2196F3'
    }
  ],
  scenes: [
    {
      id: 'intro',
      type: 'text',
      duration: 3,
      template: {
        title: '{{topic}}',
        subtitle: 'Matematik Dersi',
        content: ['Bu derste {{topic}} konusunu öğreneceğiz'],
        style: {
          fontSize: 48,
          color: '{{primaryColor}}',
          fontWeight: 'bold',
          textAlign: 'center'
        }
      },
      animation: { type: 'fade-in', speed: 'normal' }
    },
    {
      id: 'formula',
      type: 'excalidraw',
      duration: 5,
      template: {
        elements: [
          ExcalidrawShapes.text(400, 300, '{{formula}}', {
            fontSize: 32,
            strokeColor: '{{primaryColor}}'
          }),
          ExcalidrawShapes.rectangle(350, 280, 300, 80, {
            strokeColor: '{{primaryColor}}',
            backgroundColor: 'transparent'
          })
        ]
      },
      animation: { type: 'progressive-draw', speed: 'normal' }
    }
  ]
});

// Business Presentation Template
TemplateEngine.registerTemplate({
  id: 'business-presentation',
  name: 'İş Sunumu: {{title}}',
  description: '{{company}} için profesyonel iş sunumu',
  category: 'business',
  parameters: [
    {
      key: 'title',
      label: 'Sunum Başlığı',
      type: 'text',
      required: true,
      placeholder: 'Q4 Sonuçları'
    },
    {
      key: 'company',
      label: 'Şirket Adı',
      type: 'text',
      required: true,
      placeholder: 'ABC Şirketi'
    },
    {
      key: 'growth',
      label: 'Büyüme Oranı (%)',
      type: 'number',
      required: true,
      min: 0,
      max: 100,
      defaultValue: 15
    }
  ],
  scenes: [
    {
      id: 'title-slide',
      type: 'text',
      duration: 3,
      template: {
        title: '{{title}}',
        subtitle: '{{company}}',
        content: ['Profesyonel Analiz ve Sonuçlar'],
        style: {
          fontSize: 42,
          color: '#1976D2',
          fontWeight: 'bold',
          textAlign: 'center'
        }
      }
    },
    {
      id: 'growth-chart',
      type: 'chart',
      duration: 4,
      template: {
        type: 'bar',
        title: 'Büyüme Analizi',
        data: [10, 12, 14, '{{growth}}'],
        labels: ['Q1', 'Q2', 'Q3', 'Q4']
      }
    }
  ]
});

// Technical Explanation Template
TemplateEngine.registerTemplate({
  id: 'tech-explanation',
  name: 'Teknik Açıklama: {{concept}}',
  description: '{{concept}} konusunda teknik sunum',
  category: 'technical',
  parameters: [
    {
      key: 'concept',
      label: 'Teknik Kavram',
      type: 'text',
      required: true,
      placeholder: 'API Architecture'
    },
    {
      key: 'steps',
      label: 'Adımlar',
      type: 'array',
      required: true,
      defaultValue: ['Step 1', 'Step 2', 'Step 3']
    }
  ],
  scenes: [
    {
      id: 'concept-intro',
      type: 'text',
      duration: 3,
      template: {
        title: '{{concept}}',
        subtitle: 'Teknik Açıklama',
        content: ['{{concept}} kavramını detaylı inceleyelim'],
        style: {
          fontSize: 36,
          color: '#4CAF50',
          fontWeight: 'bold',
          textAlign: 'center'
        }
      }
    },
    {
      id: 'flow-diagram',
      type: 'excalidraw',
      duration: 6,
      template: {
        elements: [
          ExcalidrawShapes.rectangle(100, 200, 150, 60, {
            strokeColor: '#4CAF50',
            backgroundColor: '#E8F5E8'
          }),
          ExcalidrawShapes.text(175, 230, 'Start', {
            fontSize: 16,
            strokeColor: '#2E7D32'
          }),
          ExcalidrawShapes.rectangle(400, 200, 150, 60, {
            strokeColor: '#FF9800',
            backgroundColor: '#FFF3E0'
          }),
          ExcalidrawShapes.text(475, 230, 'Process', {
            fontSize: 16,
            strokeColor: '#E65100'
          }),
          ExcalidrawShapes.rectangle(700, 200, 150, 60, {
            strokeColor: '#2196F3',
            backgroundColor: '#E3F2FD'
          }),
          ExcalidrawShapes.text(775, 230, 'End', {
            fontSize: 16,
            strokeColor: '#1565C0'
          })
        ]
      },
      animation: { type: 'progressive-draw', speed: 'slow' }
    }
  ]
});