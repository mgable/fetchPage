curl -XDELETE "http://localhost:9200/collectors"

curl -XPUT "http://localhost:9200/collectors"

curl -XPUT "http://localhost:9200/collectors/tins/_mapping" -d '
{
   "tins": {
      "properties": {
         "title": {
            "type": "string"
         },
         "link": {
            "type": "string"
         },
         "src": {
            "type": "string"
         },
         "meta": {
            "type": "object",
            "properties": {
            	"price": {
            		"type": "integer"
            	},
            	"bids": {
            		"type": "integer"
            	},
            	"watchers": {
            		"type": "integer"
            	},
            	"date": {
                  "type": "object",
                  "properties": {
               		"formatted": {
               			"type": "date"
               		},
               		"origin": {
               			"type": "string"
               		}
                  }
            	}
            }
         }
      }
   }
}'

curl -XPOST 'http://localhost:9200/collectors/tins/_bulk?pretty' --data-binary "@/Users/markgable/Sites/data/collectorsDB/to_be_indexed/advertising_tins/advertising_tins.formatted.json"

sleep 1

curl -XGET 'http://localhost:9200/_cat/indices?v'