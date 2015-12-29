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
         "id": {
            "type": "string"
         },
         "src": {
            "type": "object",
            "properties": {
               "origin": {
                  "type": "string"
               },
               "local": {
                  "type": "string"
               }
            }
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

curl -XPOST 'http://localhost:9200/collectors/tins/_bulk?pretty' --data-binary "@/Users/markgable/Sites/data/collectorsDB/advertising_tins/to_be_indexed/advertising_tins.formatted.json"

sleep 3

curl -XGET 'http://localhost:9200/_cat/indices?v'