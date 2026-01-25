# Temme Cloud & Tech GmbH Landing Page

This repository contains the source code for the landing page of **Temme Cloud & Tech GmbH**, built with [Hugo](https://gohugo.io/) and a custom theme (`temme-cloud`) based on `hello-friend-ng`.

## Project Details

- **Base URL**: [https://temme.cloud/](https://temme.cloud/)
- **Language**: German (`de-DE`)
- **Theme**: `temme-cloud` (custom, based on `hello-friend-ng`)
- **Config**: `hugo.toml`
- **Content Directory**: `content/`
- **Static Assets**: `static/`
- **Generated Output**: `public/` (do not edit directly)

### Key Features

- Custom theme built on top of `hello-friend-ng` for the Temme Cloud brand.
- Configurable metadata (description, keywords, og:image) and date formats.
- Home title/subtitle, sharing buttons, and language menu are configurable via `hugo.toml`.
- Footer includes company info plus links to Impressum, Datenschutz, and contact.
- Additional JavaScript hooks configured via `customJS`.

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
- **Theme**: Managed under `themes/temme-cloud`.
- **Theme Color**: Modify `themeColor` under `[params]`.
- **Footer Links**: Adjust the links in `[params.footer]`.

## Deployment

Deployment is handled by Netlify. A push to GitHub triggers a Netlify build that runs `hugo` and publishes the generated `public/` output.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contact

For inquiries, please visit [Temme Cloud & Tech GmbH](https://temme.cloud/).
