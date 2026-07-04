// Modal content, reproduced from the current site. Plain HTML strings so it is
// easy to edit later. Paper PDFs live under /pdfs/.

const pdfIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>`;

function paper(citation, href) {
  const link = href
    ? `<a class="pdf" href="${href}" target="_blank" rel="noopener">${pdfIcon} PDF</a>`
    : '';
  return `<div class="paper"><span>${citation}</span>${link}</div>`;
}

export const CARDS = [
  { id: 'about',    image: 'cards/dan_welcome.png', label: 'About',    action: 'modal' },
  { id: 'research', image: 'cards/dan_science.png', label: 'Research', action: 'modal' },
  { id: 'teaching', image: 'cards/dan_teach.png',   label: 'Teaching', action: 'modal' },
  { id: 'volcano',  image: 'cards/dan_ski.png',     label: 'Volcano',  action: 'link',  href: 'https://volcano.danbirman.com' },
  { id: 'climbing', image: 'cards/dan_climb.png',   label: 'Climbing', action: 'earth' },
];

export const MODALS = {
  about: {
    hero: 'cards/dan_welcome.png',
    body: `
      <h1>Hi! I'm Dan &mdash; I build intuitive, interactive 3D visualizations of neuroscience data.</h1>
      <p>Right now I'm a Software Engineer at the
        <a href="https://www.allenneuraldynamics.org/" target="_blank" rel="noopener">Allen Institute for Neural Dynamics</a>.
      <div class="contact">
        <a href="mailto:danbirman@gmail.com">Email</a>
        <a href="https://github.com/dbirman/" target="_blank" rel="noopener">GitHub</a>
        <a href="https://scholar.google.com/citations?user=7EFz9rcAAAAJ&hl=en" target="_blank" rel="noopener">Publications</a>
      </div>
      <div class="logos">
        <img src="logos/allen-institute.pdf" alt="Allen Institute / Neural Dynamics" title="Allen Institute / Neural Dynamics — Software Engineer, 2023–present" />
        <img src="logos/UW.png" alt="University of Washington" title="University of Washington — Postdoc, 2020–2023" />
        <img src="logos/Stanford.png" alt="Stanford University" title="Stanford University — PhD Cognitive Neuroscience, 2014–2019" />
        <img src="logos/BCCN.png" alt="BCCN Berlin" title="BCCN Berlin — Research Assistant, 2012–2013" />
        <img src="logos/Cornell.png" alt="Cornell University" title="Cornell University — BA Biology, 2008–2012" />
      </div>
      <p class="copyright">&copy; Dan Birman 2023&ndash;present &middot;
        <a href="https://github.com/dbirman/web2/" target="_blank" rel="noopener">Code</a></p>
    `,
  },

  research: {
    hero: 'cards/dan_science.png',
    body: `
      <p>I build intuitive, interactive 3D visualization tools for neuroscience. I've also studied
        visual attention using functional MRI, electrophysiology, and widefield calcium imaging, and
        contributed to a number of open-source software tools.</p>

      <h2>Allen Institute</h2>
      <h3>Data Portal</h3>
      <p>Our main entrypoint for discovering data collected at the Neural Dynamics accelerator.</p>
      <p><a href="https://data.allenneuraldynamics.org/search" target="_blank" rel="noopener">Data Portal website</a></p>

      <h3>Biodata Schema</h3>
      <p>Allen Institute metadata schema for neuroscience data assets.</p>
      <p><a href="https://aind-data-schema.readthedocs.io/en/latest/" target="_blank" rel="noopener">biodata-schema documentation</a></p>

      <h2>Virtual Brain Lab</h2>
      <h3>Pinpoint: trajectory planning for multi-probe electrophysiology</h3>
      <p>The scale of modern rodent neuroscience is quickly expanding beyond the capabilities of even
        expert experimentalists. Pinpoint brings together large-scale anatomical atlases in an intuitive
        3D environment to help experimentalists plan complex multi-probe insertions. Learn more at
        <a href="https://virtualbrainlab.org/pinpoint/installation_and_use.html" target="_blank" rel="noopener">Pinpoint's website</a>.</p>
      ${paper(`Birman, D., Yang, K. J., West, S. J., Karsh, B., Browning, Y., International Brain Laboratory, &hellip; &amp; Steinmetz, N. A. (2023). Pinpoint: trajectory planning for multi-probe electrophysiology and injections in an interactive web-based 3D environment. <i>bioRxiv</i>.`, 'pdfs/birman_biorxiv_2023.pdf')}

      <h3>Urchin: universal renderer creating helpful images for neuroscience</h3>
      <p>Neuroscience needs tools that let researchers quickly explore their data in its anatomical
        context. Urchin's intuitive API lets users plot their data in an interactive 3D space with minimal
        effort. Learn more at
        <a href="https://virtualbrainlab.org/urchin/installation_and_use.html" target="_blank" rel="noopener">Urchin's website</a>.</p>

      <h3>Glue: graphics library for Unity-based experiments</h3>
      <p>A modern 3D and virtual-reality experiment framework for human, non-human primate, and rodent
        psychophysics.</p>

      <h2>International Brain Laboratory</h2>
      <h3>Brain Atlas website</h3>
      <p>With the IBL visualization team we've developed an interactive data-exploration site for the
        electrophysiology atlas &mdash;
        <a href="https://ephysatlas.internationalbrainlab.org" target="_blank" rel="noopener">Brain Atlas website</a>.</p>

      <h3>20 Lessons in Team Science: Learning from the Experience of the International Brain Laboratory</h3>
      ${paper(`International Brain Laboratory, Bayer, H. M., Birman, D., Chapuis, G., DeWitt, E. E. J., Freitas-Silva, L., Langdon, C., Laranjeira, I., Lau, P., Paninski, L., Picard, S., Tessereau, C., Urai, A. E., Whiteway, M. R., &amp; Winter, O. 20 Lessons in Team Science: Learning from the Experience of the International Brain Laboratory. <i>Neuron</i>.`, 'pdfs/ibl_neuron_2026.pdf')}

      <h3>A brain-wide map of neural activity during complex behaviour</h3>
      ${paper(`International Brain Laboratory, Benson, B., Benson, J., Birman, D., Bonacchi, N., Carandini, M., &hellip; &amp; Witten, I. B. A brain-wide map of neural activity during complex behaviour. <i>Nature</i>.`, 'pdfs/ibl_nature_2025.pdf')}

      <h3>Reproducibility of in-vivo electrophysiological measurements in mice</h3>
      ${paper(`International Brain Laboratory, Banga, K., Benson, J., Bonacchi, N., Bruijns, S. A., Campbell, R., &hellip; &amp; Witten, I. B. (2022). Reproducibility of in-vivo electrophysiological measurements in mice. <i>bioRxiv</i>.`)}

      <h2>Computational models of visual attention</h2>
      <p>In my attention research I built computational models that linked behavior and physiology. In my
        most recent attention project we developed a model of spatial attention using a convolutional
        neural network. We found that changes in tuning &mdash; such as shifts or shrinkage of receptive
        fields &mdash; don't account well for changes in task performance in a neural network, suggesting
        they might also not be responsible for performance enhancement in human spatial attention.</p>
      ${paper(`Fox, K. J., Birman, D., &amp; Gardner, J. L. (2023). Gain, not concomitant changes in spatial receptive field properties, improves task performance in a neural network attention model. <i>eLife</i>, 12, e78392.`, 'pdfs/fox_elife_2023.pdf')}
      ${paper(`Birman, D., &amp; Gardner, J. L. (2019). A flexible readout mechanism of human sensory representations. <i>Nature Communications</i>, 10(1), 3500.`, 'pdfs/birman_ncomms_2019.pdf')}
      ${paper(`Birman, D., &amp; Gardner, J. L. (2018). A quantitative framework for motion visibility in human cortex. <i>Journal of Neurophysiology</i>.`, 'pdfs/birman_jnphys_2018.pdf')}

      <h2>Point of no return</h2>
      <p>We have an intuition that we "commit" to a decision at a specific moment. Early neuroscience
        researchers found that brain activity becomes predictive of our intentions far in advance &mdash;
        sometimes up to 10 seconds. In this experiment we showed that the point of no return, after which
        an action is guaranteed to happen, occurs only about 200&nbsp;ms before motor activity.</p>
      ${paper(`Schultze-Kraft, M.*, Birman, D.*, Rusconi, M., Allefeld, C., Görgen, K., Dähne, S., &hellip; &amp; Haynes, J. D. (2015). The point of no return in vetoing self-initiated movements. <i>PNAS</i>, 201513569. *Equal contribution.`, 'pdfs/birman_pnas_2015.pdf')}
    `,
  },

  teaching: {
    hero: 'cards/dan_teach.png',
    body: `
      <p>I have been the primary mentor for five undergraduate students and one master's student.
        Across my career I've taught over two dozen classes &mdash; introductory and upper-level
        neuroscience courses for undergraduates and graduate students. Highlights include a course I
        co-designed from scratch, "Vertical Neuroscience," which uses rock climbing to introduce concepts
        in sensory and motor neuroscience, and leading a team of teaching assistants for a 250-student
        introductory neuroscience class.</p>

      <h2>Vertical Neuroscience</h2>
      <p>Watch a <a href="https://www.youtube.com/watch?v=--sBEWfPfKA" target="_blank" rel="noopener">video</a>
        about my course, which blends motor-systems neuroscience with practical experiences in the
        climbing gym.</p>

      <h2>Mentoring</h2>
      <h3>University of Washington</h3>
      <div class="entry"><span class="what">Selina Li &mdash; <em>3D reconstruction of 2-photon and widefield calcium imaging data</em></span><span class="when">2023&ndash;</span></div>
      <div class="entry"><span class="what">Jasmine Schoch (Shenoy Fellow) &mdash; <em>Exploratory interactive 3D education tools for neuroscience</em></span><span class="when">2022&ndash;</span></div>
      <div class="entry"><span class="what">Kenneth Yang (Mary Gates Scholar) &mdash; <em>Automating multi-probe insertions for efficient, reproducible electrophysiology</em></span><span class="when">2022&ndash;</span></div>
      <div class="entry"><span class="what">Kai Nylund (Mary Gates Scholar) &mdash; <em>Designing 3D interactive neuroscience visualizations</em></span><span class="when">2021&ndash;2022</span></div>
      <h3>Stanford University</h3>
      <div class="entry"><span class="what">Kai Fox &mdash; <em>Gain in a neural network attention model</em></span><span class="when">2018&ndash;2022</span></div>
      <div class="entry"><span class="what">Aarush Selvan &mdash; <em>Human and monkey task-learning dynamics</em></span><span class="when">2017&ndash;2018</span></div>

      <h2>Teaching</h2>
      <div class="entry"><span class="what">Summer Workshop for the Dynamic Brain &mdash; <em>Organizer</em></span><span class="when">Summer 2026</span></div>
      <div class="entry"><span class="what">Summer Workshop for the Dynamic Brain &mdash; <em>Organizer</em></span><span class="when">Summer 2025</span></div>
      <div class="entry"><span class="what">Brain–Machine Interface Seminar (NEUSCI 450) &mdash; <em>Instructor</em></span><span class="when">Fall 2020</span></div>
      <div class="entry"><span class="what">Vertical Neuroscience (PSYCH 149s) &mdash; <em>Instructor, w/ Corey Fernandez</em></span><span class="when">Summer 2019</span></div>
      <div class="entry"><span class="what">Introduction to Cognitive Neuroscience (PSYCH 50) &mdash; <em>Head TA</em></span><span class="when">2016&ndash;2019</span></div>
      <div class="entry"><span class="what">Cognitive Neuroscience first-year seminar (NEPR 207) &mdash; <em>TA</em></span><span class="when">2016&ndash;2018</span></div>
      <div class="entry"><span class="what">Methods for Behavioral &amp; Social Sciences (PSYCH 252) &mdash; <em>TA</em></span><span class="when">Fall 2016</span></div>

      <h2>Outdoor education</h2>
      <div class="entry"><span class="what">Vertical rescue</span><span class="when">2011&ndash;2019</span></div>
      <div class="entry"><span class="what">Belaying from above &amp; rappelling clinic</span><span class="when">2018&ndash;2019</span></div>
      <div class="entry"><span class="what">Sport leading clinic</span><span class="when">2018&ndash;2019</span></div>
      <div class="entry"><span class="what">Crack climbing clinic</span><span class="when">Fall 2017</span></div>
      <div class="entry"><span class="what">Winter camping · Multipitch (Red Rock, Gunks)</span><span class="when">2010&ndash;2012</span></div>
    `,
  },
};
