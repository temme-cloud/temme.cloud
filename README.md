# Temme Cloud & Tech GmbH Landing Page

This repository contains the source code for the landing page of **Temme Cloud & Tech GmbH**, built using [Hugo](https://gohugo.io/) and the `hello-friend-ng` theme.

## Project Details

- **Base URL**: [https://temme.cloud/](https://temme.cloud/)
- **Language**: German (`de-DE`)
- **Theme**: `hello-friend-ng`
- **Content Directory**: `content`

### Key Features

- Customizable metadata for SEO (description, keywords, etc.).
- Configurable date formats.
- Home subtitle: "Hier entsteht gerade etwas Neues."
- Sharing buttons and global language menu can be toggled.
- Footer links to Impressum and Datenschutz pages.

## Setup Instructions

1. **Install Hugo**
   Follow the [Hugo installation guide](https://gohugo.io/getting-started/installing/) for your operating system.

2. **Clone the Repository**
   ```bash
   git clone https://github.com/your-repo/temme-cloud-landingpage.git
   cd temme-cloud-landingpage
   ```

3. **Run the Development Server**
   Start the Hugo development server to preview changes locally:
   ```bash
   hugo server
   ```

   The site will be available at `http://localhost:1313`.

4. **Build the Site**
   Generate the static files for deployment:
   ```bash
   hugo
   ```

   The output will be in the `public/` directory.

## Configuration

The main configuration file is `hugo.toml`. Key settings include:

- **Base URL**: Update the `baseURL` field if deploying to a different domain.
- **Theme Color**: Modify the `themeColor` under `[params]`.
- **Footer Links**: Adjust the links in `[params.footer.bottomText]`.

## Deployment

You can deploy the generated static files to any web server or hosting platform. Popular options include:

- [Netlify](https://www.netlify.com/)
- [Vercel](https://vercel.com/)
- [GitHub Pages](https://pages.github.com/)

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contact

For inquiries, please visit [Temme Cloud & Tech GmbH](https://temme.cloud/).
