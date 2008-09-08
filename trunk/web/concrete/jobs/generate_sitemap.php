<?
/**
*
* Responsible for loading the indexed search class and initiating the reindex command.
* @package Utilities
*/
class GenerateSitemap extends Job {

	public $jName="Generate Sitemap File";
	public $jDescription="Generate the sitemap.xml file that search engines use to crawl your site.";

	function run() {
	
		$ni = Loader::helper('navigation');
		
		$xmlFile = DIR_BASE.'/sitemap.xml';
		$xmlHead = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
				  ."<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
		$home = '';
		$c = Page::getByID(1, "ACTIVE");
		$changefreq = $c->getAttribute('sitemap_changefreq');
		$priority = $c->getAttribute("sitemap_priority");
		
		if ($changefreq == '') {
			$changefreq = 'monthly';
		}
		if ($priority == '') {
			$priority = '1.0';
		}
		$home .= "<url>\n";
		$home .= "<loc>". BASE_URL.DIR_REL."</loc>\n";
		$home .= "  <lastmod> " . date('Y-m-d') . "</lastmod>\n";
		$home .= "  <changefreq>" . $changefreq . "</changefreq>\n";
		$home .= "  <priority>" . $priority . "</priority>\n";
		$home .= "</url>\n";
		$xmlFoot = "</urlset>\n";
		
		if (!file_exists($xmlFile)) touch($xmlFile);
		
		if (is_writable($xmlFile)) {
			if (!$handle = fopen($xmlFile, 'w')) {
				 throw new Exception("Cannot open $xmlFile");
			}
			
			fwrite($handle, $xmlHead);
			fwrite($handle, $home);
			fflush($handle);
			
			$db = Loader::db();
			$collection_attributes = Loader::model('collection_attributes');
			$r = $db->query("select cID from Pages order by cID asc");
			$g = Group::getByID(GUEST_GROUP_ID);
			$nh = Loader::helper('navigation');
			
			while ($row = $r->fetchRow()) {
				$c = Page::getByID($row['cID'], 'ACTIVE');
				$g->setPermissionsForObject($c);
				if ($g->canRead()) {			
	
					$name = ($c->getCollectionName()) ? $c->getCollectionName() : '(No name)';
					$cPath = $ni->getCollectionURL($c);
					$changefreq = $c->getAttribute('sitemap_changefreq');
					$priority = $c->getAttribute("sitemap_priority");
					
					if ($changefreq == '') {
						$changefreq = 'monthly';
					}
					if ($priority == '') {
						$priority = '0.5';
					}
					
					$node = "";		
					$node .= "<url>\n";
					$node .= "<loc>" . $cPath . "</loc>\n";
					$node .= "  <lastmod>". substr($c->getCollectionDateLastModified(), 0, 10)."</lastmod>\n";
					$node .= "  <changefreq>".$changefreq."</changefreq>\n";
					$node .= "  <priority>".$priority."</priority>\n";
					$node .= "</url>\n";
					
					fwrite($handle, $node);
					fflush($handle);
				
				}
			}
		
			fwrite($handle, $xmlFoot);
			fflush($handle);
			fclose($handle);
			
			return "Sitemap XML File Saved.";
			
		} else {
			throw new Exception("The file $xmlFile is not writable");
		}
	}

}

?>